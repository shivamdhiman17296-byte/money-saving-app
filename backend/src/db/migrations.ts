import { query } from './connection';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create all required database tables
 */
export async function createTables() {
  console.log('🔄 Creating database tables...');

  try {
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        phone_number VARCHAR(20),
        profile_picture TEXT,
        is_verified BOOLEAN DEFAULT false,
        verified_at TIMESTAMP,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Users table created');

    // Transactions table
    await query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit')),
        status VARCHAR(50) DEFAULT 'completed',
        date TIMESTAMP NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Transactions table created');

    // Create index for faster queries
    await query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
    `);

    // Budgets table
    await query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        "limit" DECIMAL(12,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        spent DECIMAL(12,2) DEFAULT 0,
        period VARCHAR(20) DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly')),
        alert_threshold DECIMAL(3,1) DEFAULT 80.0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Budgets table created');

    // Create index
    await query(`
      CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
    `);

    // Payments table
    await query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_upi VARCHAR(255) NOT NULL,
        recipient_name VARCHAR(255) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
        transaction_id VARCHAR(255),
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Payments table created');

    // Create index
    await query(`
      CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    `);

    // Bank Accounts table
    await query(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        account_number VARCHAR(50) NOT NULL,
        bank_name VARCHAR(255) NOT NULL,
        account_holder VARCHAR(255) NOT NULL,
        ifsc_code VARCHAR(20) NOT NULL,
        account_type VARCHAR(50) DEFAULT 'savings',
        is_primary BOOLEAN DEFAULT false,
        is_verified BOOLEAN DEFAULT false,
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Bank Accounts table created');

    // Create index
    await query(`
      CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
    `);

    // User Preferences table
    await query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        email_notifications BOOLEAN DEFAULT true,
        sms_alerts BOOLEAN DEFAULT true,
        budget_alerts BOOLEAN DEFAULT true,
        weekly_reports BOOLEAN DEFAULT true,
        marketing_emails BOOLEAN DEFAULT false,
        theme VARCHAR(20) DEFAULT 'light',
        language VARCHAR(20) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ User Preferences table created');

    // Session/Refresh Tokens table
    await query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        revoked_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Refresh Tokens table created');

    // Create index
    await query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
    `);

    console.log('✅ All tables created successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

/**
 * Seed demo data for testing
 */
export async function seedDemoData() {
  console.log('🌱 Seeding demo data...');

  try {
    // Insert demo user
    const userId = uuidv4();
    await query(
      `INSERT INTO users (id, email, password_hash, full_name, phone_number, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [
        userId,
        'demo@example.com',
        '$2b$10$example_hash', // This would be a real bcrypt hash in production
        'Demo User',
        '9876543210',
        true,
      ]
    );
    console.log('✅ Demo user created');

    // Insert sample transactions
    const transactionIds = [uuidv4(), uuidv4(), uuidv4()];
    for (let i = 0; i < transactionIds.length; i++) {
      await query(
        `INSERT INTO transactions (id, user_id, description, amount, category, type, date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          transactionIds[i],
          userId,
          ['Salary', 'Groceries', 'Electricity Bill'][i],
          [50000, 2500, 1200][i],
          ['Income', 'Food', 'Utilities'][i],
          ['credit', 'debit', 'debit'][i],
          new Date(),
        ]
      );
    }
    console.log('✅ Demo transactions created');

    // Insert sample budget
    await query(
      `INSERT INTO budgets (id, user_id, name, "limit", category, spent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), userId, 'Monthly Groceries', 10000, 'Food', 2500]
    );
    console.log('✅ Demo budget created');

    // Insert user preferences
    await query(
      `INSERT INTO user_preferences (id, user_id, email_notifications, budget_alerts)
       VALUES ($1, $2, $3, $4)`,
      [uuidv4(), userId, true, true]
    );
    console.log('✅ Demo preferences created');

    console.log('✅ Demo data seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

/**
 * Drop all tables (for development/testing only)
 */
export async function dropTables() {
  console.log('🗑️ Dropping all tables...');

  try {
    await query(`
      DROP TABLE IF EXISTS refresh_tokens CASCADE;
      DROP TABLE IF EXISTS user_preferences CASCADE;
      DROP TABLE IF EXISTS bank_accounts CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS budgets CASCADE;
      DROP TABLE IF EXISTS transactions CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log('✅ All tables dropped');
    return true;
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    throw error;
  }
}

/**
 * Initialize database (create tables + seed data)
 */
export async function initializeDatabase() {
  console.log('📊 Initializing database...');
  await createTables();
  // Uncomment to seed demo data
  // await seedDemoData();
  console.log('✅ Database initialized successfully!');
}
