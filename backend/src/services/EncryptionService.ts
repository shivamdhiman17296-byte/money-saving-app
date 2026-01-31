/**
 * Encryption & Tokenization Service
 * Handles field-level encryption and sensitive data tokenization
 */

import crypto from 'crypto';

export class EncryptionService {
  private readonly encryptionKey: Buffer;
  private readonly algorithm = 'aes-256-gcm';

  constructor() {
    // Should be loaded from environment variable
    const keyHex = process.env.ENCRYPTION_KEY || '';
    this.encryptionKey = Buffer.from(keyHex, 'hex');
    
    if (this.encryptionKey.length !== 32) {
      throw new Error('Encryption key must be 32 bytes (64 hex chars)');
    }
  }

  /**
   * Encrypt sensitive data
   * @param plaintext Data to encrypt
   * @returns Encrypted data in format: iv:encrypted:authTag
   */
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Return in format: iv:encrypted:authTag
    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
  }

  /**
   * Decrypt encrypted data
   * @param encrypted Encrypted data in format: iv:encrypted:authTag
   * @returns Decrypted plaintext
   */
  decrypt(encrypted: string): string {
    try {
      const parts = encrypted.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encryptedData = parts[1];
      const authTag = Buffer.from(parts[2], 'hex');

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.encryptionKey,
        iv
      );
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  }

  /**
   * Create token from sensitive data (tokenization)
   * Generates a deterministic token that can be used for lookups
   * @param data Data to tokenize
   * @returns Deterministic token
   */
  tokenize(data: string): string {
    // Using HMAC for deterministic tokenization
    const hmac = crypto.createHmac('sha256', this.encryptionKey);
    hmac.update(data);
    return `token_${hmac.digest('hex').substring(0, 32)}`;
  }

  /**
   * Hash password using bcrypt
   * @param password Password to hash
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare password with hash
   * @param password Plain password
   * @param hash Hashed password
   * @returns Whether password matches
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate random token
   * @param length Token length
   * @returns Random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate OTP
   * @param length OTP length (default 6 digits)
   * @returns OTP string
   */
  generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  /**
   * Create HMAC signature for request validation
   * @param data Data to sign
   * @param secret Secret key
   * @returns HMAC signature
   */
  createSignature(data: string, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    return hmac.digest('hex');
  }

  /**
   * Verify HMAC signature
   * @param data Original data
   * @param signature Signature to verify
   * @param secret Secret key
   * @returns Whether signature is valid
   */
  verifySignature(data: string, signature: string, secret: string): boolean {
    const expectedSignature = this.createSignature(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Mask sensitive information
   * @param value Value to mask
   * @param visibleChars Number of visible chars at end (default 4)
   * @returns Masked value (e.g., ****5678)
   */
  maskSensitiveData(value: string, visibleChars: number = 4): string {
    if (value.length <= visibleChars) {
      return '*'.repeat(value.length);
    }
    const masked = '*'.repeat(value.length - visibleChars);
    return masked + value.slice(-visibleChars);
  }
}

export const encryptionService = new EncryptionService();
