# 🗄️ Database Setup Guide

## Option A: Supabase (RECOMMENDED - Easiest)

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Sign Up"
3. Create account with GitHub or email
4. Create new project

### Step 2: Get Connection String
1. In Supabase dashboard, go to **Settings → Database**
2. Copy the **Connection String** (URI format)
3. Should look like:
   ```
   postgresql://[user]:[password]@[host]:[port]/[database]
   ```

### Step 3: Save to .env
Create file: `backend/.env`
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## Option B: PostgreSQL Local (Windows)

### Step 1: Download PostgreSQL
1. Download from https://www.postgresql.org/download/windows/
2. Choose PostgreSQL 16
3. Run installer, set password for `postgres` user

### Step 2: Create Database
Open PostgreSQL Terminal or use pgAdmin:
```sql
CREATE DATABASE money_saver;
```

### Step 3: Get Connection String
```
postgresql://postgres:your_password@localhost:5432/money_saver
```

### Step 4: Save to .env
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/money_saver
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## Option C: SQLite (SIMPLEST - No Setup Required)

### Step 1: No Installation Needed!
SQLite is built into Node.js

### Step 2: Save to .env
```
DATABASE_URL=sqlite:./database.db
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Quick Start (Using Supabase)

1. **Go to https://supabase.com → Sign Up**
2. **Create new project**
3. **Go to Settings → Database → Connection String**
4. **Copy the connection string**
5. **Create `backend/.env` file:**
   ```
   DATABASE_URL=<paste_your_connection_string_here>
   JWT_SECRET=your_secret_key_12345
   NODE_ENV=production
   FRONTEND_URL=https://yourdomain.com
   ```
6. **Run database migrations** (see next section)

---

## 📊 Database Tables That Will Be Created

When you run the migrations, these tables will be automatically created:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  description VARCHAR(255),
  amount DECIMAL(12,2),
  category VARCHAR(100),
  type VARCHAR(20), -- 'credit' or 'debit'
  date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Budgets table
CREATE TABLE budgets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  limit DECIMAL(12,2),
  category VARCHAR(100),
  spent DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  upi_id VARCHAR(255),
  recipient_name VARCHAR(255),
  amount DECIMAL(12,2),
  status VARCHAR(50), -- 'pending', 'success', 'failed'
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ Next Steps

1. **Choose your database option** (I recommend Supabase for easiest setup)
2. **Create .env file** with your connection string
3. **Run migrations** (automatic on first server start)
4. **Test the backend** with real database
5. **Deploy to production**

---

## 🆘 Troubleshooting

### "Cannot connect to database"
- Check DATABASE_URL is correct
- Verify firewall allows connections
- For Supabase: Ensure IP is whitelisted (usually auto)

### "Tables not created"
- Run: `npm run migrate` in backend folder
- Check logs for SQL errors

### "Connection timeout"
- Database server might be down
- Check connection string format
- Test with: `psql <your_connection_string>`

---

## 📝 Database Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]
                ↓            ↓          ↓      ↓
Example: postgresql://myuser:mypass123@db.supabase.co:5432/postgres
```

