# Database Schema Design

## 1. PostgreSQL Main Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_pic_url TEXT,
  
  -- KYC Information
  aadhar_encrypted VARCHAR(255) UNIQUE,
  aadhar_verified BOOLEAN DEFAULT FALSE,
  pan_encrypted VARCHAR(255) UNIQUE,
  pan_verified BOOLEAN DEFAULT FALSE,
  dob DATE,
  
  -- Account Status
  account_status ENUM('active', 'suspended', 'closed') DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  
  -- Settings
  currency_preference CHAR(3) DEFAULT 'INR',
  notification_enabled BOOLEAN DEFAULT TRUE,
  dark_mode BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  
  -- Device Binding
  device_fingerprint_hash VARCHAR(255),
  device_id VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  
  -- Indexes
  INDEX idx_email (email),
  INDEX idx_phone (phone_number),
  INDEX idx_aadhar (aadhar_encrypted),
  INDEX idx_pan (pan_encrypted),
  INDEX idx_created_at (created_at)
);

-- Trigger for updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
```

#### bank_accounts
```sql
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Bank Details (encrypted)
  account_number_encrypted VARCHAR(255) NOT NULL,
  ifsc_code VARCHAR(11) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  account_holder_name VARCHAR(100) NOT NULL,
  account_type ENUM('savings', 'current', 'salary') DEFAULT 'savings',
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verification_method ENUM('penny_test', 'aadhar_match', 'auto') DEFAULT 'penny_test',
  verification_date TIMESTAMP,
  
  -- UPI Handle
  upi_handle VARCHAR(50), -- Example: user@okhdfcbank
  upi_verified BOOLEAN DEFAULT FALSE,
  
  -- Sync Configuration
  auto_sync_enabled BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMP,
  sync_frequency ENUM('daily', 'weekly', 'manual') DEFAULT 'daily',
  
  -- Status
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_upi_handle (upi_handle),
  UNIQUE (user_id, account_number_encrypted)
);
```

#### transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bank_account_id UUID REFERENCES bank_accounts(id),
  
  -- Transaction Details
  type ENUM('debit', 'credit') NOT NULL,
  amount_paise BIGINT NOT NULL, -- Store in paise (1 INR = 100 paise)
  currency CHAR(3) DEFAULT 'INR',
  
  -- UPI Specific
  upi_transaction_id VARCHAR(50),
  upi_reference_number VARCHAR(50),
  payer_upi_id VARCHAR(100),
  payee_upi_id VARCHAR(100),
  
  -- Description & Notes
  description VARCHAR(255),
  notes TEXT,
  
  -- Party Information
  party_name VARCHAR(100),
  party_account_number_encrypted VARCHAR(255),
  party_ifsc VARCHAR(11),
  party_type ENUM('individual', 'merchant', 'business') DEFAULT 'individual',
  
  -- Transaction Status
  status ENUM('pending', 'success', 'failed', 'reversed') DEFAULT 'pending',
  error_code VARCHAR(50),
  error_message TEXT,
  
  -- Category & Tags
  category_id UUID REFERENCES categories(id),
  category_name VARCHAR(50),
  category_auto_detected BOOLEAN DEFAULT FALSE,
  tags VARCHAR[] DEFAULT ARRAY[]::VARCHAR[],
  
  -- Manual vs Auto
  is_manual BOOLEAN DEFAULT FALSE,
  created_by_user BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  transaction_date TIMESTAMP NOT NULL,
  transaction_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Fraud Detection
  is_flagged BOOLEAN DEFAULT FALSE,
  fraud_score DECIMAL(3,2), -- 0.00 to 1.00
  
  -- Recurring
  recurring_id UUID REFERENCES recurring_transactions(id),
  
  INDEX idx_user_id (user_id),
  INDEX idx_bank_account_id (bank_account_id),
  INDEX idx_transaction_date (transaction_date),
  INDEX idx_category_id (category_id),
  INDEX idx_status (status),
  INDEX idx_upi_ref (upi_reference_number),
  INDEX idx_is_flagged (is_flagged),
  INDEX idx_created_at (created_at)
);
```

#### upi_mandates
```sql
CREATE TABLE upi_mandates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Mandate Details
  mandate_id VARCHAR(50) UNIQUE NOT NULL,
  upi_id VARCHAR(100) NOT NULL,
  bank_account_id UUID REFERENCES bank_accounts(id),
  
  -- Merchant Details
  merchant_name VARCHAR(100) NOT NULL,
  merchant_upi_id VARCHAR(100) NOT NULL,
  merchant_category VARCHAR(50),
  
  -- Mandate Rules
  frequency ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly') NOT NULL,
  amount_paise BIGINT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Status
  status ENUM('active', 'paused', 'revoked', 'expired') DEFAULT 'active',
  next_collection_date DATE,
  last_collection_date TIMESTAMP,
  total_collections_done INT DEFAULT 0,
  total_amount_collected_paise BIGINT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_mandate_id (mandate_id),
  INDEX idx_status (status)
);
```

#### categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for default
  
  name VARCHAR(50) NOT NULL,
  description TEXT,
  icon_url TEXT,
  color_hex VARCHAR(7),
  
  -- Category Type
  type ENUM('expense', 'income', 'transfer') DEFAULT 'expense',
  
  -- Built-in vs Custom
  is_custom BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- ML Model Training
  keywords VARCHAR[] DEFAULT ARRAY[]::VARCHAR[], -- For auto-detection
  confidence_threshold DECIMAL(3,2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_name (name),
  UNIQUE (user_id, name)
);

-- Default categories (inserted at schema creation)
INSERT INTO categories (name, type, is_custom, icon_url, color_hex) VALUES
('Food & Dining', 'expense', FALSE, '/icons/food.svg', '#FF6B6B'),
('Transportation', 'expense', FALSE, '/icons/transport.svg', '#4ECDC4'),
('Shopping', 'expense', FALSE, '/icons/shopping.svg', '#45B7D1'),
('Entertainment', 'expense', FALSE, '/icons/entertainment.svg', '#FFA07A'),
('Utilities', 'expense', FALSE, '/icons/utilities.svg', '#98D8C8'),
('Healthcare', 'expense', FALSE, '/icons/health.svg', '#F7DC6F'),
('Education', 'expense', FALSE, '/icons/education.svg', '#BB8FCE'),
('Salary', 'income', FALSE, '/icons/salary.svg', '#52C77A'),
('Freelance', 'income', FALSE, '/icons/freelance.svg', '#52C77A'),
('Investments', 'income', FALSE, '/icons/invest.svg', '#52C77A'),
('Transfer', 'transfer', FALSE, '/icons/transfer.svg', '#95A5A6');
```

#### budgets
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  
  -- Budget Details
  name VARCHAR(100) NOT NULL,
  limit_amount_paise BIGINT NOT NULL,
  currency CHAR(3) DEFAULT 'INR',
  
  -- Period
  period ENUM('daily', 'weekly', 'monthly', 'yearly') DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Status & Progress
  status ENUM('active', 'paused', 'closed') DEFAULT 'active',
  spent_amount_paise BIGINT DEFAULT 0,
  remaining_amount_paise BIGINT GENERATED ALWAYS AS (limit_amount_paise - spent_amount_paise) STORED,
  spent_percentage DECIMAL(5,2) GENERATED ALWAYS AS ((spent_amount_paise::DECIMAL / limit_amount_paise) * 100) STORED,
  
  -- Alerts
  alert_at_percentage INT DEFAULT 80,
  alert_enabled BOOLEAN DEFAULT TRUE,
  send_notification BOOLEAN DEFAULT TRUE,
  
  -- Rollover
  allow_rollover BOOLEAN DEFAULT FALSE,
  rollover_amount_paise BIGINT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_category_id (category_id),
  INDEX idx_status (status),
  INDEX idx_period (period)
);
```

#### recurring_transactions
```sql
CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  
  -- Recurring Details
  name VARCHAR(100) NOT NULL,
  description TEXT,
  amount_paise BIGINT NOT NULL,
  
  -- Frequency
  frequency ENUM('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly') NOT NULL,
  frequency_day INT, -- Day of week (0-6) or day of month (1-31)
  frequency_month INT, -- Month for yearly (1-12)
  
  -- Duration
  start_date DATE NOT NULL,
  end_date DATE,
  occurrences_total INT,
  occurrences_completed INT DEFAULT 0,
  
  -- Status
  status ENUM('active', 'paused', 'completed') DEFAULT 'active',
  next_occurrence_date DATE,
  last_occurrence_date DATE,
  
  -- Category
  type ENUM('expense', 'income', 'transfer') DEFAULT 'expense',
  
  -- Notifications
  notify_before_days INT DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_next_occurrence_date (next_occurrence_date)
);
```

#### wallets
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Wallet Details
  name VARCHAR(50) NOT NULL,
  wallet_type ENUM('cash', 'credit_card', 'debit_card', 'digital') DEFAULT 'cash',
  color_hex VARCHAR(7),
  icon_url TEXT,
  
  -- Balance
  balance_paise BIGINT DEFAULT 0,
  currency CHAR(3) DEFAULT 'INR',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  include_in_totals BOOLEAN DEFAULT TRUE,
  
  -- Card Details (if applicable)
  card_last_four VARCHAR(4),
  card_bank VARCHAR(100),
  card_expiry CHAR(5), -- MM/YY
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_wallet_type (wallet_type),
  INDEX idx_is_active (is_active)
);
```

#### savings_goals
```sql
CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Goal Details
  name VARCHAR(100) NOT NULL,
  description TEXT,
  target_amount_paise BIGINT NOT NULL,
  current_amount_paise BIGINT DEFAULT 0,
  currency CHAR(3) DEFAULT 'INR',
  
  -- Timeline
  target_date DATE NOT NULL,
  start_date DATE DEFAULT CURRENT_DATE,
  monthly_contribution_paise BIGINT,
  
  -- Progress
  progress_percentage DECIMAL(5,2) GENERATED ALWAYS AS ((current_amount_paise::DECIMAL / target_amount_paise) * 100) STORED,
  status ENUM('active', 'on_hold', 'completed', 'cancelled') DEFAULT 'active',
  
  -- Category & Icon
  category VARCHAR(50),
  icon_url TEXT,
  color_hex VARCHAR(7),
  
  -- Notifications
  notify_monthly BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_target_date (target_date)
);
```

---

## 2. MongoDB Collections (Analytics & Logs)

### analytics_events
```javascript
db.createCollection("analytics_events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "event_type", "timestamp"],
      properties: {
        _id: { bsonType: "objectId" },
        user_id: { bsonType: "string" },
        
        event_type: {
          enum: [
            "transaction_created",
            "budget_exceeded",
            "savings_goal_reached",
            "upi_payment_sent",
            "bank_account_linked",
            "login",
            "logout",
            "settings_changed"
          ]
        },
        
        event_data: { bsonType: "object" },
        device_info: {
          bsonType: "object",
          properties: {
            device_type: { enum: ["mobile", "web", "tablet"] },
            os: { bsonType: "string" },
            app_version: { bsonType: "string" },
            user_agent: { bsonType: "string" }
          }
        },
        
        ip_address: { bsonType: "string" },
        session_id: { bsonType: "string" },
        timestamp: { bsonType: "date" },
        created_at: { bsonType: "date" }
      }
    }
  }
});

// TTL Index - auto delete after 365 days
db.analytics_events.createIndex(
  { created_at: 1 },
  { expireAfterSeconds: 31536000 }
);

db.analytics_events.createIndex({ user_id: 1, timestamp: -1 });
db.analytics_events.createIndex({ event_type: 1, timestamp: -1 });
```

### audit_logs
```javascript
db.createCollection("audit_logs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "action", "timestamp"],
      properties: {
        _id: { bsonType: "objectId" },
        user_id: { bsonType: "string" },
        
        action: {
          enum: [
            "transaction_created",
            "transaction_modified",
            "budget_created",
            "budget_modified",
            "account_linked",
            "account_unlinked",
            "password_changed",
            "settings_updated",
            "export_requested"
          ]
        },
        
        resource_type: { bsonType: "string" },
        resource_id: { bsonType: "string" },
        
        changes: {
          bsonType: "object",
          properties: {
            before: { bsonType: "object" },
            after: { bsonType: "object" }
          }
        },
        
        ip_address: { bsonType: "string" },
        user_agent: { bsonType: "string" },
        status: { enum: ["success", "failure"] },
        error_message: { bsonType: "string" },
        
        timestamp: { bsonType: "date" }
      }
    }
  }
});

// Audit logs never expire
db.audit_logs.createIndex({ user_id: 1, timestamp: -1 });
db.audit_logs.createIndex({ action: 1, timestamp: -1 });
db.audit_logs.createIndex({ resource_type: 1, resource_id: 1 });
```

### spending_patterns
```javascript
db.createCollection("spending_patterns", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "month", "year"],
      properties: {
        _id: { bsonType: "objectId" },
        user_id: { bsonType: "string" },
        month: { bsonType: "int", minimum: 1, maximum: 12 },
        year: { bsonType: "int" },
        
        total_income_paise: { bsonType: "long" },
        total_expense_paise: { bsonType: "long" },
        
        by_category: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              category: { bsonType: "string" },
              amount_paise: { bsonType: "long" },
              count: { bsonType: "int" },
              average_amount_paise: { bsonType: "long" },
              trend: { enum: ["up", "down", "stable"] }
            }
          }
        },
        
        daily_breakdown: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              day: { bsonType: "int" },
              amount_paise: { bsonType: "long" },
              transactions_count: { bsonType: "int" }
            }
          }
        },
        
        insights: {
          bsonType: "object",
          properties: {
            highest_spending_category: { bsonType: "string" },
            unusual_transactions: { bsonType: "int" },
            saving_rate: { bsonType: "double" }
          }
        },
        
        created_at: { bsonType: "date" }
      }
    }
  }
});

db.spending_patterns.createIndex({ user_id: 1, year: 1, month: 1 });
```

### notifications
```javascript
db.createCollection("notifications", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "type", "timestamp"],
      properties: {
        _id: { bsonType: "objectId" },
        user_id: { bsonType: "string" },
        
        type: {
          enum: [
            "transaction_alert",
            "budget_warning",
            "goal_update",
            "security_alert",
            "savings_tip",
            "recurring_reminder"
          ]
        },
        
        title: { bsonType: "string" },
        message: { bsonType: "string" },
        
        related_transaction_id: { bsonType: "string" },
        related_budget_id: { bsonType: "string" },
        
        is_read: { bsonType: "bool", default: false },
        is_archived: { bsonType: "bool", default: false },
        
        action_url: { bsonType: "string" },
        
        created_at: { bsonType: "date" },
        read_at: { bsonType: "date" }
      }
    }
  }
});

// TTL for old notifications - delete after 90 days
db.notifications.createIndex(
  { created_at: 1 },
  { expireAfterSeconds: 7776000 }
);

db.notifications.createIndex({ user_id: 1, created_at: -1 });
db.notifications.createIndex({ user_id: 1, is_read: 1 });
```

---

## 3. Redis Key-Value Structure

### Session Management
```
session:{sessionId}
  user_id: "uuid"
  device_id: "string"
  ip_address: "string"
  login_timestamp: timestamp
  expires_at: timestamp
  ttl: 86400 (24 hours)

user_sessions:{userId}
  set of sessionIds
  ttl: 86400
```

### OTP Storage
```
otp:{email/phone}:{purpose}
  value: "123456"
  attempts: 0
  created_at: timestamp
  ttl: 300 (5 minutes)

otp_attempts:{email/phone}
  count: 0
  locked_until: timestamp (if exceeded 5 attempts)
  ttl: 3600 (1 hour)
```

### Caching Layer
```
user:{userId}:profile
  {user_profile_json}
  ttl: 300 (5 minutes)

user:{userId}:transactions:recent
  [transaction_list_json]
  ttl: 60 (1 minute)

user:{userId}:budgets
  {budgets_json}
  ttl: 600 (10 minutes)

user:{userId}:wallet_balance
  {balance_paise: int}
  ttl: 30 (30 seconds)

category:default
  [list_of_default_categories]
  ttl: 86400 (24 hours)
```

### Rate Limiting
```
rate_limit:{userId}:upi_payment
  count: 0
  window_reset: timestamp
  limit: 10/hour

rate_limit:{ipAddress}:login_attempt
  count: 0
  window_reset: timestamp
  limit: 5/15minutes
```

### Queues
```
queue:transaction_processing
  [list of transaction jobs]

queue:analytics:spending_pattern_calculation
  [list of calculation jobs]

queue:notification:send_email
  [list of email notification jobs]
```

---

## 4. Elasticsearch Indexes

### transactions_index
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "user_id": { "type": "keyword" },
      "description": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "amount_paise": { "type": "long" },
      "category": { "type": "keyword" },
      "transaction_date": { "type": "date", "format": "yyyy-MM-dd" },
      "status": { "type": "keyword" },
      "is_flagged": { "type": "boolean" },
      "created_at": { "type": "date" }
    }
  }
}
```

---

## 5. SQL Constraints & Indexes Summary

```sql
-- Critical Performance Indexes
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_category_user ON transactions(category_id, user_id);
CREATE INDEX idx_budgets_user_period ON budgets(user_id, period);
CREATE INDEX idx_recurring_next_date ON recurring_transactions(next_occurrence_date, status);
CREATE INDEX idx_upi_mandates_user_status ON upi_mandates(user_id, status);

-- Uniqueness Constraints
ALTER TABLE users ADD CONSTRAINT uq_email_verified_users UNIQUE(email) WHERE email_verified = TRUE;
ALTER TABLE bank_accounts ADD CONSTRAINT uq_upi_handle UNIQUE(upi_handle) WHERE upi_verified = TRUE;

-- Foreign Key Constraints with CASCADE
ALTER TABLE transactions 
  ADD CONSTRAINT fk_transactions_category 
  FOREIGN KEY (category_id) 
  REFERENCES categories(id) ON DELETE SET NULL;

-- Check Constraints
ALTER TABLE transactions 
  ADD CONSTRAINT check_amount_positive CHECK (amount_paise > 0);

ALTER TABLE budgets 
  ADD CONSTRAINT check_limit_positive CHECK (limit_amount_paise > 0);
```

---

## 6. Data Retention Policy

| Data Type | Retention | Archive | Delete After |
|-----------|-----------|---------|--------------|
| Transactions | 6 years | Year 2-6 in S3 | After 7 years |
| Audit Logs | 7 years | Yes | After 7 years |
| Analytics | 2 years | 1 year in S3 | After 2 years |
| Notifications | 3 months | - | After 3 months |
| Error Logs | 90 days | - | After 90 days |
| Session Logs | 30 days | - | After 30 days |
| User KYC | Life + 7 years | After KYC | After 7 years post-closure |

---

**Next Document:** API documentation
