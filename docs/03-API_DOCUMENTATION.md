# API Documentation

## Base Configuration

```
Base URL: https://api.moneysaver.in/api/v1
All endpoints require: Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
All monetary amounts in PAISE (1 INR = 100 paise)
```

---

## Authentication Endpoints

### POST /auth/register
**Purpose:** User registration with email/phone

```json
Request:
{
  "email": "user@example.com",
  "phone_number": "+919876543210",
  "password": "SecurePassword123!",
  "first_name": "Rajesh",
  "last_name": "Kumar",
  "dob": "1995-05-15"
}

Response (201 Created):
{
  "success": true,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Registration successful. OTP sent to email & phone",
  "verification_required": true
}

Errors:
- 400: Email/phone already registered
- 422: Invalid input format
- 429: Too many registration attempts
```

### POST /auth/verify-otp
**Purpose:** Verify OTP for email/phone

```json
Request:
{
  "email": "user@example.com",
  "otp": "123456",
  "purpose": "registration"
}

Response (200 OK):
{
  "success": true,
  "email_verified": true,
  "message": "Email verified successfully"
}
```

### POST /auth/login
**Purpose:** User login (email/phone + password)

```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "device_id": "device_fingerprint_hash"
}

Response (200 OK):
{
  "success": true,
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "refresh_token_value",
  "expires_in": 3600,
  "user": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "first_name": "Rajesh",
    "profile_pic_url": null,
    "two_factor_enabled": false
  }
}

Errors:
- 401: Invalid credentials
- 403: Account suspended
- 429: Too many login attempts
```

### POST /auth/biometric-login
**Purpose:** Login using biometric (face/touch ID)

```json
Request:
{
  "biometric_token": "encrypted_biometric_data",
  "device_id": "device_fingerprint",
  "public_key": "device_public_key"
}

Response (200 OK):
{
  "success": true,
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600
}
```

### POST /auth/refresh-token
**Purpose:** Refresh access token

```json
Request:
{
  "refresh_token": "refresh_token_value"
}

Response (200 OK):
{
  "access_token": "new_jwt_token",
  "expires_in": 3600
}

Errors:
- 401: Invalid or expired refresh token
```

### POST /auth/logout
**Purpose:** Logout and invalidate session

```json
Request: {}

Response (200 OK):
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Management Endpoints

### GET /users/profile
**Purpose:** Get user profile information

```json
Response (200 OK):
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "phone_number": "+919876543210",
  "first_name": "Rajesh",
  "last_name": "Kumar",
  "dob": "1995-05-15",
  "profile_pic_url": "https://cdn.moneysaver.in/users/550e8400.jpg",
  "aadhar_verified": true,
  "pan_verified": false,
  "account_status": "active",
  "two_factor_enabled": true,
  "dark_mode": false,
  "created_at": "2024-01-15T10:30:00Z",
  "last_login_at": "2024-01-27T14:22:00Z"
}
```

### PUT /users/profile
**Purpose:** Update user profile

```json
Request:
{
  "first_name": "Rajesh",
  "last_name": "Kumar",
  "dob": "1995-05-15",
  "dark_mode": true,
  "notification_enabled": true
}

Response (200 OK):
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### POST /users/profile/picture
**Purpose:** Upload profile picture

```
Request: multipart/form-data
  - profile_picture: <file>

Response (200 OK):
{
  "success": true,
  "profile_pic_url": "https://cdn.moneysaver.in/users/550e8400.jpg"
}
```

### POST /users/enable-2fa
**Purpose:** Enable two-factor authentication

```json
Request:
{
  "phone_number": "+919876543210"
}

Response (200 OK):
{
  "success": true,
  "message": "2FA enabled. OTP sent to registered phone"
}
```

---

## Bank Account Management

### GET /accounts
**Purpose:** Get all linked bank accounts

```json
Response (200 OK):
{
  "accounts": [
    {
      "id": "account_uuid_1",
      "bank_name": "HDFC Bank",
      "account_holder_name": "Rajesh Kumar",
      "account_type": "savings",
      "account_number_masked": "****5678",
      "ifsc_code": "HDFC0000001",
      "upi_handle": "rajesh.kumar@hdfc",
      "is_verified": true,
      "is_primary": true,
      "is_active": true,
      "auto_sync_enabled": true,
      "last_sync_at": "2024-01-27T14:00:00Z",
      "linked_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total_accounts": 1
}
```

### POST /accounts
**Purpose:** Link a new bank account (start verification process)

```json
Request:
{
  "account_number": "123456789012345",
  "ifsc_code": "HDFC0000001",
  "account_holder_name": "Rajesh Kumar",
  "account_type": "savings",
  "verification_method": "penny_test"
}

Response (201 Created):
{
  "account_id": "account_uuid",
  "status": "pending_verification",
  "verification_method": "penny_test",
  "message": "Two penny test deposits will be credited to your account within 24-48 hours",
  "next_step": "Verify the exact penny amounts in the /accounts/{account_id}/verify-penny endpoint"
}
```

### POST /accounts/{account_id}/verify-penny
**Purpose:** Verify penny amounts for bank account linking

```json
Request:
{
  "first_amount_paise": 10,
  "second_amount_paise": 25
}

Response (200 OK):
{
  "success": true,
  "is_verified": true,
  "message": "Bank account verified successfully",
  "upi_handle": "rajesh.kumar@hdfc"
}

Errors:
- 400: Incorrect amounts
- 403: Maximum verification attempts exceeded
```

### GET /accounts/{account_id}/transactions
**Purpose:** Get transactions for a specific account (paginated)

```json
Request Parameters:
  - from_date: "2024-01-01" (optional)
  - to_date: "2024-01-27" (optional)
  - page: 1 (optional, default: 1)
  - limit: 20 (optional, default: 20)
  - sort: "date_desc" (optional)

Response (200 OK):
{
  "account_id": "account_uuid",
  "transactions": [
    {
      "id": "txn_uuid",
      "type": "debit",
      "amount_paise": 50000,
      "description": "Walmart Purchase",
      "category": "Shopping",
      "status": "success",
      "transaction_date": "2024-01-27",
      "party_name": "Walmart",
      "upi_reference_number": "312010123456789"
    }
  ],
  "pagination": {
    "total": 245,
    "page": 1,
    "limit": 20,
    "total_pages": 13
  }
}
```

### DELETE /accounts/{account_id}
**Purpose:** Unlink a bank account

```json
Request: {}

Response (200 OK):
{
  "success": true,
  "message": "Bank account removed successfully"
}

Errors:
- 403: Cannot remove primary account (set another as primary first)
```

---

## UPI & Payment Endpoints

### POST /upi/generate-qr
**Purpose:** Generate UPI QR code for receiving payment

```json
Request:
{
  "amount_paise": 50000,
  "description": "Rent Payment",
  "transaction_reference": "RENT-JAN-2024"
}

Response (200 OK):
{
  "qr_code_id": "qr_uuid",
  "qr_image_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "upi_link": "upi://pay?pa=rajesh.kumar@hdfc&pn=Rajesh%20Kumar&am=500&tn=Rent%20Payment&tr=RENT-JAN-2024",
  "expires_at": "2024-01-27T19:00:00Z",
  "valid_for_seconds": 3600
}
```

### POST /upi/pay
**Purpose:** Send UPI payment to another user/merchant

```json
Request:
{
  "amount_paise": 50000,
  "payee_upi_id": "recipient@bank",
  "payee_name": "John Doe",
  "description": "Monthly rent",
  "transaction_reference": "RENT-JAN-2024",
  "from_account_id": "account_uuid"
}

Response (202 Accepted):
{
  "transaction_id": "txn_uuid",
  "status": "pending",
  "upi_reference_number": "312010123456789",
  "message": "Payment initiated. Awaiting NPCI confirmation",
  "retry_after_seconds": 30
}

WebSocket Update (Real-time):
{
  "type": "payment_status_update",
  "transaction_id": "txn_uuid",
  "status": "success",
  "final_upi_reference": "312010123456789",
  "timestamp": "2024-01-27T15:30:45Z"
}

Errors:
- 400: Invalid UPI ID format
- 402: Insufficient balance
- 409: Duplicate transaction (within 5 minutes)
- 429: Rate limit exceeded (10 payments/hour)
```

### POST /upi/request-payment
**Purpose:** Request payment from another user via UPI

```json
Request:
{
  "amount_paise": 100000,
  "payer_upi_id": "payer@bank",
  "description": "Dinner split",
  "expiry_days": 7
}

Response (201 Created):
{
  "request_id": "req_uuid",
  "status": "pending",
  "payment_link": "https://moneysaver.in/pay?req=req_uuid&token=abc123",
  "qr_code": "data:image/png;base64,...",
  "expires_at": "2024-02-03T15:30:00Z"
}
```

### GET /upi/payment-requests
**Purpose:** Get received payment requests

```json
Response (200 OK):
{
  "requests": [
    {
      "id": "req_uuid",
      "requester_name": "Jane Smith",
      "requester_upi_id": "jane@bank",
      "amount_paise": 100000,
      "description": "Dinner split",
      "status": "pending",
      "created_at": "2024-01-26T20:00:00Z",
      "expires_at": "2024-02-03T15:30:00Z"
    }
  ]
}
```

### POST /upi/payment-requests/{request_id}/approve
**Purpose:** Approve and execute payment request

```json
Request:
{
  "from_account_id": "account_uuid"
}

Response (202 Accepted):
{
  "transaction_id": "txn_uuid",
  "status": "processing",
  "message": "Payment request approved. Processing..."
}
```

### POST /upi/setup-mandate
**Purpose:** Create a recurring UPI mandate (like autopay)

```json
Request:
{
  "merchant_upi_id": "electricity@bill",
  "merchant_name": "Electricity Board",
  "amount_paise": 150000,
  "frequency": "monthly",
  "frequency_day": 5,
  "start_date": "2024-02-05",
  "end_date": "2025-02-05",
  "description": "Monthly electricity bill"
}

Response (201 Created):
{
  "mandate_id": "mandate_uuid",
  "status": "awaiting_confirmation",
  "confirmation_link": "https://moneysaver.in/confirm-mandate?id=mandate_uuid",
  "message": "Mandate created. Awaiting NPCI confirmation"
}
```

### GET /upi/mandates
**Purpose:** Get all UPI mandates

```json
Response (200 OK):
{
  "mandates": [
    {
      "id": "mandate_uuid",
      "merchant_name": "Electricity Board",
      "amount_paise": 150000,
      "frequency": "monthly",
      "status": "active",
      "next_collection_date": "2024-02-05",
      "total_collections_done": 2,
      "total_amount_collected_paise": 300000,
      "start_date": "2024-01-05",
      "end_date": "2025-02-05"
    }
  ]
}
```

### PATCH /upi/mandates/{mandate_id}
**Purpose:** Pause/revoke/resume mandate

```json
Request:
{
  "action": "pause",
  "reason": "Temporary pause"
}

Response (200 OK):
{
  "success": true,
  "status": "paused",
  "message": "Mandate paused successfully"
}
```

---

## Transaction Management

### GET /transactions
**Purpose:** Get all transactions (with filters & pagination)

```json
Request Parameters:
  - category: "Food & Dining" (optional)
  - from_date: "2024-01-01" (optional)
  - to_date: "2024-01-27" (optional)
  - type: "debit" | "credit" (optional)
  - search: "walmart" (optional)
  - status: "success|failed" (optional)
  - page: 1
  - limit: 20

Response (200 OK):
{
  "transactions": [
    {
      "id": "txn_uuid",
      "type": "debit",
      "amount_paise": 50000,
      "currency": "INR",
      "description": "Walmart Purchase",
      "category": "Shopping",
      "category_id": "cat_uuid",
      "category_auto_detected": true,
      "party_name": "Walmart",
      "status": "success",
      "transaction_date": "2024-01-27",
      "transaction_time": "15:30:45",
      "upi_reference_number": "312010123456789",
      "tags": ["groceries", "weekly"],
      "is_manual": false,
      "is_flagged": false,
      "created_at": "2024-01-27T15:30:45Z"
    }
  ],
  "pagination": {
    "total": 542,
    "page": 1,
    "limit": 20,
    "total_pages": 28
  },
  "summary": {
    "total_income_paise": 500000,
    "total_expense_paise": 250000,
    "net_paise": 250000
  }
}
```

### POST /transactions
**Purpose:** Manually create/add a transaction

```json
Request:
{
  "type": "debit",
  "amount_paise": 30000,
  "description": "Lunch with friends",
  "category_id": "cat_uuid",
  "party_name": "Restaurant XYZ",
  "transaction_date": "2024-01-27",
  "notes": "Team lunch celebration"
}

Response (201 Created):
{
  "transaction_id": "txn_uuid",
  "status": "created",
  "category": "Food & Dining",
  "created_at": "2024-01-27T16:00:00Z"
}
```

### GET /transactions/{transaction_id}
**Purpose:** Get single transaction details

```json
Response (200 OK):
{
  "id": "txn_uuid",
  "type": "debit",
  "amount_paise": 50000,
  "description": "Walmart Purchase",
  "category": "Shopping",
  "party_name": "Walmart",
  "party_account_number_masked": "****5678",
  "status": "success",
  "transaction_date": "2024-01-27",
  "upi_reference_number": "312010123456789",
  "receipt_url": "https://moneysaver.in/receipts/txn_uuid.pdf",
  "bank_statement_available": true,
  "created_at": "2024-01-27T15:30:45Z"
}
```

### PUT /transactions/{transaction_id}
**Purpose:** Update transaction (recategorize, add notes, add tags)

```json
Request:
{
  "category_id": "new_cat_uuid",
  "notes": "Updated notes",
  "tags": ["groceries", "weekly", "bulk_buy"]
}

Response (200 OK):
{
  "success": true,
  "message": "Transaction updated successfully"
}
```

### DELETE /transactions/{transaction_id}
**Purpose:** Delete a manually created transaction

```json
Response (200 OK):
{
  "success": true,
  "message": "Transaction deleted successfully"
}

Errors:
- 403: Cannot delete bank-synced transactions
```

---

## Budget Management

### GET /budgets
**Purpose:** Get all budgets

```json
Response (200 OK):
{
  "budgets": [
    {
      "id": "budget_uuid",
      "name": "Monthly Food Budget",
      "category": "Food & Dining",
      "limit_amount_paise": 500000,
      "spent_amount_paise": 250000,
      "remaining_amount_paise": 250000,
      "spent_percentage": 50.0,
      "period": "monthly",
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "status": "active",
      "alert_at_percentage": 80,
      "days_remaining": 4
    }
  ]
}
```

### POST /budgets
**Purpose:** Create a new budget

```json
Request:
{
  "name": "Monthly Food Budget",
  "category_id": "cat_uuid",
  "limit_amount_paise": 500000,
  "period": "monthly",
  "start_date": "2024-02-01",
  "end_date": "2025-01-31",
  "alert_at_percentage": 80,
  "alert_enabled": true,
  "send_notification": true,
  "allow_rollover": true
}

Response (201 Created):
{
  "budget_id": "budget_uuid",
  "message": "Budget created successfully"
}
```

### PUT /budgets/{budget_id}
**Purpose:** Update budget settings

```json
Request:
{
  "limit_amount_paise": 600000,
  "alert_at_percentage": 75
}

Response (200 OK):
{
  "success": true,
  "message": "Budget updated successfully"
}
```

### DELETE /budgets/{budget_id}
**Purpose:** Delete a budget

```json
Response (200 OK):
{
  "success": true,
  "message": "Budget deleted successfully"
}
```

---

## Recurring Transactions

### GET /recurring
**Purpose:** Get all recurring transactions

```json
Response (200 OK):
{
  "recurring_transactions": [
    {
      "id": "recur_uuid",
      "name": "Gym Membership",
      "amount_paise": 50000,
      "frequency": "monthly",
      "frequency_day": 1,
      "status": "active",
      "category": "Healthcare",
      "start_date": "2024-01-01",
      "end_date": "2025-12-31",
      "next_occurrence_date": "2024-02-01",
      "occurrences_completed": 1,
      "notify_before_days": 1
    }
  ]
}
```

### POST /recurring
**Purpose:** Create recurring transaction

```json
Request:
{
  "name": "Gym Membership",
  "amount_paise": 50000,
  "category_id": "cat_uuid",
  "frequency": "monthly",
  "frequency_day": 1,
  "start_date": "2024-02-01",
  "end_date": "2025-12-31",
  "notify_before_days": 1
}

Response (201 Created):
{
  "recurring_id": "recur_uuid",
  "message": "Recurring transaction created successfully"
}
```

---

## Savings Goals

### GET /goals
**Purpose:** Get all savings goals

```json
Response (200 OK):
{
  "goals": [
    {
      "id": "goal_uuid",
      "name": "Vacation Fund",
      "target_amount_paise": 500000,
      "current_amount_paise": 150000,
      "progress_percentage": 30.0,
      "target_date": "2024-12-31",
      "monthly_contribution_paise": 50000,
      "status": "active",
      "category": "Travel",
      "months_remaining": 11
    }
  ]
}
```

### POST /goals
**Purpose:** Create a savings goal

```json
Request:
{
  "name": "Vacation Fund",
  "target_amount_paise": 500000,
  "target_date": "2024-12-31",
  "monthly_contribution_paise": 50000,
  "category": "Travel"
}

Response (201 Created):
{
  "goal_id": "goal_uuid",
  "message": "Savings goal created successfully"
}
```

### POST /goals/{goal_id}/contribute
**Purpose:** Add money to savings goal

```json
Request:
{
  "amount_paise": 50000
}

Response (200 OK):
{
  "success": true,
  "new_balance_paise": 200000,
  "progress_percentage": 40.0
}
```

---

## Analytics & Insights

### GET /analytics/dashboard
**Purpose:** Get dashboard summary (main page data)

```json
Response (200 OK):
{
  "summary": {
    "total_balance_paise": 1000000,
    "total_income_this_month_paise": 500000,
    "total_expense_this_month_paise": 250000,
    "net_savings_paise": 250000,
    "savings_rate_percentage": 50.0,
    "budget_health": "good",
    "budgets_exceeded": 0
  },
  "quick_stats": {
    "accounts_linked": 2,
    "transactions_this_month": 45,
    "recurring_transactions_active": 3,
    "savings_goals_active": 2,
    "alerts_pending": 1
  },
  "card_style": {
    "primary_color": "#4ECDC4",
    "accent_color": "#FF6B6B"
  }
}
```

### GET /analytics/spending-by-category
**Purpose:** Get spending breakdown by category

```json
Request Parameters:
  - period: "month" | "week" | "year" (default: month)
  - from_date: "2024-01-01" (optional)
  - to_date: "2024-01-27" (optional)

Response (200 OK):
{
  "period": "month",
  "period_label": "January 2024",
  "total_expense_paise": 250000,
  "by_category": [
    {
      "category": "Food & Dining",
      "amount_paise": 100000,
      "percentage": 40.0,
      "transaction_count": 25,
      "average_transaction_paise": 4000,
      "budget_limit_paise": 150000,
      "is_over_budget": false,
      "trend": "up"
    },
    {
      "category": "Shopping",
      "amount_paise": 75000,
      "percentage": 30.0,
      "transaction_count": 8,
      "average_transaction_paise": 9375,
      "budget_limit_paise": 100000,
      "is_over_budget": false,
      "trend": "stable"
    }
  ]
}
```

### GET /analytics/spending-trends
**Purpose:** Get spending trends (time-series data)

```json
Request Parameters:
  - type: "daily" | "weekly" | "monthly"
  - period_months: 6 (default: 1)

Response (200 OK):
{
  "trend_type": "monthly",
  "data": [
    {
      "period": "2023-08-01",
      "income_paise": 500000,
      "expense_paise": 200000,
      "net_paise": 300000,
      "transaction_count": 45,
      "top_category": "Food & Dining"
    },
    {
      "period": "2023-09-01",
      "income_paise": 500000,
      "expense_paise": 250000,
      "net_paise": 250000,
      "transaction_count": 52,
      "top_category": "Shopping"
    }
  ],
  "average_monthly_expense_paise": 225000,
  "trend_direction": "up"
}
```

### GET /analytics/insights
**Purpose:** Get AI-powered insights

```json
Response (200 OK):
{
  "insights": [
    {
      "type": "savings_opportunity",
      "title": "Cut food spending",
      "message": "You spent 40% on food this month. Average for your profile is 25%.",
      "potential_savings_paise": 37500,
      "priority": "high"
    },
    {
      "type": "goal_projection",
      "title": "Vacation goal on track",
      "message": "At current savings rate, you'll reach your vacation goal by Oct 2024",
      "timeline": "10 months",
      "priority": "medium"
    },
    {
      "type": "anomaly_detection",
      "title": "Unusual spending detected",
      "message": "Shopping expense is 150% higher than usual. Review transaction?",
      "potential_fraud_risk": false,
      "priority": "low"
    }
  ]
}
```

### GET /analytics/forecast
**Purpose:** Get spending forecast for next month

```json
Response (200 OK):
{
  "forecast_month": "February 2024",
  "predicted_expense_paise": 260000,
  "confidence_percentage": 85.0,
  "by_category": [
    {
      "category": "Food & Dining",
      "predicted_amount_paise": 105000,
      "confidence": 88.0,
      "budget_limit_paise": 150000,
      "will_exceed_budget": false
    }
  ],
  "recommendations": [
    "You might exceed your shopping budget. Consider adjusting limit.",
    "Recurring expenses will add ₹1,50,000 next month."
  ]
}
```

### POST /analytics/export
**Purpose:** Export transactions/report

```json
Request:
{
  "format": "csv|pdf|excel",
  "from_date": "2024-01-01",
  "to_date": "2024-01-31",
  "include": ["transactions", "budgets", "insights"]
}

Response (202 Accepted):
{
  "export_id": "export_uuid",
  "status": "processing",
  "download_url": "https://moneysaver.in/exports/export_uuid.csv",
  "expires_at": "2024-02-03T15:30:00Z"
}
```

---

## Notifications Endpoints

### GET /notifications
**Purpose:** Get all notifications

```json
Request Parameters:
  - unread_only: true (optional)
  - limit: 20

Response (200 OK):
{
  "notifications": [
    {
      "id": "notif_uuid",
      "type": "budget_warning",
      "title": "Food budget at 85%",
      "message": "You've spent ₹4,25,000 of ₹5,00,000 on Food & Dining",
      "is_read": false,
      "created_at": "2024-01-27T14:30:00Z",
      "related_budget_id": "budget_uuid"
    }
  ],
  "unread_count": 3
}
```

### PATCH /notifications/{notification_id}/mark-read
**Purpose:** Mark notification as read

```json
Response (200 OK):
{
  "success": true
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid input parameters",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "request_id": "req_abc123def",
    "timestamp": "2024-01-27T15:30:45Z"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| INVALID_REQUEST | 400 | Invalid input parameters |
| UNAUTHORIZED | 401 | Missing/invalid JWT token |
| FORBIDDEN | 403 | User lacks permission |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource conflict (duplicate) |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily down |

---

## Rate Limiting

```
Global: 1000 requests/hour per user
Auth endpoints: 10 requests/hour per IP
UPI payments: 50 requests/hour per user
Login attempts: 5 per 15 minutes per IP

Header: X-RateLimit-Remaining: 999
Header: X-RateLimit-Reset: 1706364000
```

---

**Next Document:** Security & authentication flow
