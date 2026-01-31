# UPI Integration & Security Implementation Guide

## 1. UPI Integration Architecture

### NPCI Integration Flow

```
User Initiates UPI Payment
    ↓
[Validation] - Check balance, limits, KYC
    ↓
[Encryption] - Tokenize UPI credentials
    ↓
[NPCI Gateway] - Submit to NPCI
    ├─ Live Production: https://api.npci.org.in/gateway/prod
    └─ Sandbox Testing: https://sandbox.npci.org.in/gateway/api
    ↓
[Bank Processing] - Bank verifies & processes
    ↓
[NPCI Callback] - Send confirmation
    ↓
[Transaction Update] - Update status in DB
    ↓
[Notifications] - Send receipt via SMS/Email/Push
```

## 2. UPI Service Implementation

```typescript
// Service for UPI operations
export class UPIService {
  /**
   * Generate UPI QR Code for receiving payment
   * Input: amount, description
   * Output: QR code image + UPI link
   */
  async generateQRCode(
    userId: string,
    amount: number,
    description: string
  ): Promise<QRCodeResponse> {
    // 1. Fetch user's UPI handle from verified bank account
    const bankAccount = await this.getBankAccount(userId);
    
    // 2. Create UPI deep link
    const upiLink = `upi://pay?pa=${bankAccount.upi_handle}&pn=${encodeURIComponent(
      bankAccount.account_holder_name
    )}&am=${amount / 100}&tn=${encodeURIComponent(description)}`;
    
    // 3. Generate QR code from deep link (using qrcode library)
    const qrImage = await QRCode.toDataURL(upiLink);
    
    // 4. Save QR metadata to cache
    await this.redisService.set(`qr:${qrId}`, qrMetadata, 3600);
    
    return { qrImage, upiLink, expiresAt: timestamp + 3600 };
  }

  /**
   * Send UPI payment to recipient
   * Input: payer account, payee UPI ID, amount
   * Output: transaction status
   */
  async sendPayment(paymentRequest: UPIPaymentRequest): Promise<Transaction> {
    // 1. Validate input
    this.validatePaymentRequest(paymentRequest);
    
    // 2. Check rate limiting
    await this.checkRateLimit(paymentRequest.user_id, 'upi_payment');
    
    // 3. Verify sender's account balance
    await this.verifyBalance(
      paymentRequest.user_id,
      paymentRequest.amount_paise
    );
    
    // 4. Create transaction record with status: PENDING
    const transaction = await this.transactionRepo.create({
      status: 'pending',
      type: 'debit',
      user_id: paymentRequest.user_id,
      // ... other fields
    });
    
    // 5. Tokenize UPI credentials
    const tokenizedUPI = this.encryptionService.tokenize(
      paymentRequest.payee_upi_id
    );
    
    // 6. Call NPCI Gateway
    const npciResponse = await this.callNPCIGateway({
      mandate_id: generateUUID(),
      payer_account: paymentRequest.from_account_id,
      payee_upi: paymentRequest.payee_upi_id,
      amount: paymentRequest.amount_paise,
      reference_id: transaction.id,
      // ... NPCI required fields
    });
    
    // 7. Update transaction with NPCI response
    transaction.upi_reference_number = npciResponse.rrn;
    transaction.upi_transaction_id = npciResponse.txn_id;
    
    // 8. Emit async job for callback monitoring
    await this.jobQueue.add('monitor_upi_payment', {
      transaction_id: transaction.id,
      timeout_seconds: 120,
    });
    
    // 9. Return transaction (still pending)
    return transaction;
  }

  /**
   * Handle payment callback from NPCI
   * Called when bank processes the payment
   */
  async handlePaymentCallback(
    callbackData: NPCICallbackPayload
  ): Promise<void> {
    // 1. Verify callback signature from NPCI
    this.verifyNPCISignature(callbackData);
    
    // 2. Find transaction by RRN
    const transaction = await this.transactionRepo.findByRRN(
      callbackData.rrn
    );
    
    // 3. Update transaction status
    if (callbackData.status === 'SUCCESS') {
      transaction.status = 'success';
      transaction.amount_paise = callbackData.amount;
      // Update user's wallet/balance
      await this.updateUserBalance(transaction.user_id, transaction);
    } else if (callbackData.status === 'FAILED') {
      transaction.status = 'failed';
      transaction.error_code = callbackData.error_code;
      transaction.error_message = callbackData.error_message;
    }
    
    // 4. Save updated transaction
    await transaction.save();
    
    // 5. Emit event to notification service
    this.eventBus.emit('payment.completed', {
      transaction_id: transaction.id,
      status: transaction.status,
      user_id: transaction.user_id,
    });
    
    // 6. Broadcast real-time update via WebSocket
    this.socketService.emit(`user:${transaction.user_id}`, {
      type: 'payment_status_update',
      transaction_id: transaction.id,
      status: transaction.status,
    });
  }

  /**
   * Create UPI Mandate for recurring payments
   */
  async createMandate(mandateRequest: MandateRequest): Promise<UPIMandate> {
    // 1. Validate mandate frequency
    this.validateMandateFrequency(mandateRequest.frequency);
    
    // 2. Call NPCI Mandate API
    const mandateResponse = await this.callNPCIGateway({
      service: 'create_mandate',
      mandate_type: 'RECURRING',
      // ... mandate details
    });
    
    // 3. Create mandate record
    const mandate = await this.mandateRepo.create({
      user_id: mandateRequest.user_id,
      mandate_id: mandateResponse.mandate_id,
      // ... other fields
      status: 'awaiting_confirmation',
    });
    
    // 4. Send confirmation link to user
    const confirmationLink = `https://app.moneysaver.in/confirm-mandate?id=${mandate.id}`;
    await this.notificationService.sendEmail(
      user.email,
      'Confirm UPI Mandate',
      confirmationLink
    );
    
    return mandate;
  }

  /**
   * Process pending mandates (scheduled job)
   * Runs every hour to collect from active mandates
   */
  async processPendingMandates(): Promise<void> {
    // 1. Find all active mandates with due next_collection_date
    const dueMandates = await this.mandateRepo.find({
      status: 'active',
      next_collection_date: { $lte: new Date() },
    });
    
    for (const mandate of dueMandates) {
      try {
        // 2. Create recurring transaction
        const transaction = await this.transactionRepo.create({
          // ...
          recurring_id: mandate.id,
        });
        
        // 3. Call NPCI to process mandate collection
        const result = await this.callNPCIGateway({
          service: 'collect_mandate',
          mandate_id: mandate.mandate_id,
          // ...
        });
        
        // 4. Update mandate with collection details
        mandate.total_collections_done++;
        mandate.total_amount_collected_paise += mandate.amount_paise;
        mandate.last_collection_date = new Date();
        mandate.next_collection_date = this.calculateNextDate(
          mandate.frequency,
          mandate.next_collection_date
        );
        await mandate.save();
        
      } catch (error) {
        // Log failed collection for retry
        this.logger.error(`Mandate collection failed: ${mandate.id}`, error);
        await this.jobQueue.add('retry_mandate_collection', {
          mandate_id: mandate.id,
          retry_count: 0,
        });
      }
    }
  }

  /**
   * Call NPCI Gateway
   */
  private async callNPCIGateway(request: any): Promise<any> {
    try {
      const signature = this.createNPCISignature(request);
      
      const response = await axios.post(
        process.env.NPCI_GATEWAY_URL,
        request,
        {
          headers: {
            'X-Signature': signature,
            'X-API-Key': process.env.NPCI_API_KEY,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
      
      return response.data;
    } catch (error) {
      this.logger.error('NPCI Gateway call failed', error);
      throw new Error('Payment processing failed');
    }
  }

  /**
   * Create NPCI signature
   */
  private createNPCISignature(data: any): string {
    const dataString = JSON.stringify(data);
    return this.encryptionService.createSignature(
      dataString,
      process.env.NPCI_API_SECRET
    );
  }
}
```

## 3. Security Implementation Details

### Field-Level Encryption

```typescript
// Encrypt before saving to database
@BeforeInsert()
@BeforeUpdate()
async encryptSensitiveFields() {
  if (this.account_number_encrypted) {
    this.account_number_encrypted = await encryptionService.encrypt(
      this.account_number_encrypted
    );
  }
  if (this.aadhar_encrypted) {
    this.aadhar_encrypted = await encryptionService.encrypt(
      this.aadhar_encrypted
    );
  }
}

// Decrypt after loading from database
@AfterLoad()
async decryptSensitiveFields() {
  if (this.account_number_encrypted) {
    this.account_number_encrypted = await encryptionService.decrypt(
      this.account_number_encrypted
    );
  }
}
```

### Tokenization for UPI

```typescript
// Instead of storing actual UPI ID in some places, store token
const upiToken = encryptionService.tokenize(userUPIId);
// This allows secure lookups without exposing actual UPI
```

### Biometric Authentication

```typescript
export class BiometricAuthService {
  /**
   * Register biometric
   * Client sends encrypted biometric data + device public key
   */
  async registerBiometric(
    userId: string,
    biometricToken: string,
    devicePublicKey: string
  ): Promise<void> {
    // 1. Verify device public key format
    this.validatePublicKey(devicePublicKey);
    
    // 2. Encrypt biometric token with device public key
    const encrypted = this.encryptWithPublicKey(
      biometricToken,
      devicePublicKey
    );
    
    // 3. Store encrypted biometric in secure vault
    // Never store plain biometric data
    await this.vaultService.store(`biometric:${userId}`, encrypted);
  }

  /**
   * Authenticate with biometric
   * Client sends biometric data + device signature
   */
  async authenticateWithBiometric(
    userId: string,
    biometricData: string,
    deviceSignature: string
  ): Promise<JWTPayload> {
    // 1. Verify device signature
    const deviceKey = await this.getDevicePublicKey(userId);
    this.verifySignature(biometricData, deviceSignature, deviceKey);
    
    // 2. Verify biometric matches stored data
    const storedBiometric = await this.vaultService.get(`biometric:${userId}`);
    // Compare using secure comparison (prevents timing attacks)
    const isValid = this.secureCompare(biometricData, storedBiometric);
    
    if (!isValid) {
      throw new Error('Biometric authentication failed');
    }
    
    // 3. Generate OTP for final confirmation
    const otp = this.encryptionService.generateOTP();
    await this.redisService.set(`otp:biometric:${userId}`, otp, 300);
    
    // 4. Send OTP via SMS
    await this.smsService.send(user.phone_number, `Your OTP is: ${otp}`);
    
    return { requires_otp: true, otp_reference: uuid() };
  }
}
```

### OTP Generation & Validation

```typescript
export class OTPService {
  /**
   * Generate and send OTP
   */
  async generateAndSendOTP(
    email: string,
    phone: string,
    purpose: 'login' | 'registration' | 'payment'
  ): Promise<{ otp_reference: string; retry_after: number }> {
    // 1. Check rate limit (max 5 OTP per hour)
    const attemptCount = await this.redisService.incr(
      `otp_attempts:${email}`
    );
    if (attemptCount > 5) {
      await this.redisService.expire(`otp_attempts:${email}`, 3600);
      throw new Error('Too many OTP requests. Try again after 1 hour.');
    }
    
    // 2. Generate 6-digit OTP
    const otp = this.encryptionService.generateOTP(6);
    
    // 3. Store OTP with purpose & expiry
    const reference = uuid();
    await this.redisService.set(
      `otp:${reference}:${purpose}`,
      JSON.stringify({
        code: otp,
        email,
        phone,
        created_at: Date.now(),
        attempts: 0,
      }),
      300 // 5 minutes expiry
    );
    
    // 4. Send via SMS & Email in parallel
    await Promise.all([
      this.smsService.send(phone, `Your OTP is: ${otp}`),
      this.emailService.send(
        email,
        'Your Verification Code',
        `Your OTP: ${otp}. Valid for 5 minutes.`
      ),
    ]);
    
    return { otp_reference: reference, retry_after: 60 };
  }

  /**
   * Verify OTP
   */
  async verifyOTP(
    reference: string,
    otp: string,
    purpose: string
  ): Promise<boolean> {
    // 1. Get OTP from cache
    const otpData = await this.redisService.get(
      `otp:${reference}:${purpose}`
    );
    if (!otpData) {
      throw new Error('OTP expired or invalid');
    }
    
    const parsed = JSON.parse(otpData);
    
    // 2. Check attempts
    if (parsed.attempts >= 3) {
      await this.redisService.del(`otp:${reference}:${purpose}`);
      throw new Error('Too many attempts. Request new OTP.');
    }
    
    // 3. Verify OTP using constant-time comparison
    const isValid = this.secureCompare(otp, parsed.code);
    
    if (!isValid) {
      parsed.attempts++;
      await this.redisService.set(
        `otp:${reference}:${purpose}`,
        JSON.stringify(parsed),
        300
      );
      throw new Error('Invalid OTP');
    }
    
    // 4. Delete OTP after successful verification
    await this.redisService.del(`otp:${reference}:${purpose}`);
    
    return true;
  }
}
```

## 4. Request/Response Security

### HMAC-Based Request Signing

```typescript
// Client sends request with signature
POST /api/v1/upi/pay HTTP/1.1
X-Signature: hmac_sha256_of_request_body
X-Timestamp: 1706299440
X-Request-ID: unique_request_id

// Server verifies
const calculateSignature = (body: any, secret: string) => {
  const bodyString = JSON.stringify(body);
  return crypto
    .createHmac('sha256', secret)
    .update(bodyString)
    .digest('hex');
};

const provided = req.headers['x-signature'];
const calculated = calculateSignature(req.body, apiSecret);
if (!secureCompare(provided, calculated)) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

## 5. Database Security

### Row-Level Security (PostgreSQL)

```sql
-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Only users can see their own transactions
CREATE POLICY user_transactions ON transactions
FOR SELECT USING (user_id = current_user_id());

CREATE POLICY user_insert ON transactions
FOR INSERT WITH CHECK (user_id = current_user_id());
```

### Audit Logging

```typescript
// Automatically log all changes
@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() user_id: string;
  @Column() action: string; // 'create' | 'update' | 'delete'
  @Column() resource_type: string;
  @Column() resource_id: string;
  @Column('jsonb') changes: object; // { before, after }
  @Column() ip_address: string;
  @CreateDateColumn() created_at: Date;
}

// Hook to save audit logs
@AfterInsert()
async logInsert() {
  await auditService.log({
    action: 'create',
    resource_type: this.constructor.name,
    resource_id: this.id,
    changes: { before: null, after: this },
  });
}
```

## 6. Monitoring & Alerts

```typescript
export class FraudDetectionService {
  /**
   * Calculate fraud score for transaction
   */
  async calculateFraudScore(transaction: Transaction): Promise<number> {
    let score = 0;

    // 1. Check if amount exceeds user's typical transaction
    const userAvg = await this.getUserAverageTransaction(transaction.user_id);
    if (transaction.amount_paise > userAvg * 3) {
      score += 0.3; // High weight
    }

    // 2. Check if category is unusual for user
    const userCategoryPrefs = await this.getUserCategoryPreferences(
      transaction.user_id
    );
    if (!userCategoryPrefs[transaction.category_name]) {
      score += 0.2;
    }

    // 3. Check velocity (multiple transactions in short time)
    const recentCount = await this.getRecentTransactionCount(
      transaction.user_id,
      300 // last 5 minutes
    );
    if (recentCount > 5) {
      score += 0.25;
    }

    // 4. Check geographic anomaly
    const userCountry = 'IN';
    if (transaction.country !== userCountry) {
      score += 0.4;
    }

    // 5. Check device change
    const lastDevice = await this.getLastSeenDevice(transaction.user_id);
    if (lastDevice !== transaction.device_id) {
      score += 0.15;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Alert on suspicious activity
   */
  async checkAndAlert(transaction: Transaction): Promise<void> {
    const fraudScore = await this.calculateFraudScore(transaction);

    if (fraudScore >= 0.7) {
      transaction.is_flagged = true;
      transaction.fraud_score = fraudScore;

      // Send alert email
      await this.notificationService.sendSecurityAlert(
        transaction.user_id,
        `Suspicious transaction detected: ₹${transaction.amount_paise / 100}`
      );

      // Block transaction if score > 0.85
      if (fraudScore > 0.85) {
        transaction.status = 'blocked';
      }
    }

    await transaction.save();
  }
}
```

---

**Next Step:** Implement remaining backend services and frontend
