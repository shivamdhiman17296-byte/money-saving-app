# 🚀 Quick Start: Setup for Production (5-10 minutes)

## ⚡ Ultra-Quick Setup (Choose One)

### Option 1: Supabase (EASIEST - Recommended)

#### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email
4. Click "New Project"
5. Fill in project details:
   - Project name: `money_saver`
   - Password: (save this!)
   - Region: Choose your region
6. Wait for project creation (2-3 minutes)

#### Step 2: Get Connection String
1. After project loads, go to **Settings** (bottom left)
2. Click **Database**
3. Find **"Connection string"** section
4. Click the tab showing **URI**
5. Copy the entire string
6. Replace `[YOUR-PASSWORD]` with your actual password

It looks like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.supabase.co:5432/postgres
```

#### Step 3: Setup Backend
1. Open `backend` folder in VS Code
2. Create `.env` file (copy from `.env.example`)
3. Paste into `.env`:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.supabase.co:5432/postgres
JWT_SECRET=super_secret_key_12345_change_this
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
```
4. Save the file

#### Step 4: Initialize Database
Open terminal in `backend` folder and run:
```bash
npm run db:init
```

You should see:
```
✅ Database connection successful
✅ Users table created
✅ Transactions table created
... (all tables)
✅ All tables created successfully!
```

#### Step 5: Start Servers
Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Open browser: `http://localhost:5173`

---

### Option 2: PostgreSQL Local (Windows)

#### Step 1: Install PostgreSQL
1. Download: https://www.postgresql.org/download/windows/
2. Run installer
3. Choose PostgreSQL 16
4. Set password for `postgres` user (remember this!)
5. Port: 5432 (default)
6. Locale: [Default]
7. Click Install

#### Step 2: Create Database
1. After install, open PostgreSQL terminal (pgAdmin)
2. Or use command line:
```bash
psql -U postgres
```
3. At prompt, run:
```sql
CREATE DATABASE money_saver;
```
4. Exit: `\q`

#### Step 3: Setup Backend
1. Open `backend` folder
2. Create `.env` file:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/money_saver
JWT_SECRET=super_secret_key_12345_change_this
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
```
3. Replace `your_password` with PostgreSQL password you set

#### Step 4: Initialize Database
```bash
cd backend
npm run db:init
```

#### Step 5: Start Servers
Same as Option 1 above

---

### Option 3: SQLite (Simplest - No Installation)

#### Step 1: Setup Backend
1. Open `backend` folder
2. Create `.env` file:
```
DATABASE_URL=sqlite:./database.db
JWT_SECRET=super_secret_key_12345_change_this
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Step 2: Initialize Database
```bash
cd backend
npm run db:init
```

#### Step 3: Start Servers
Same as above

---

## 🧪 Testing Your Setup

### Test 1: Check Database Connection
```bash
cd backend
npm run db:test
```

Expected output:
```
✅ Database connection successful
```

### Test 2: Test Backend API
```bash
# In another terminal
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok"}
```

### Test 3: Test Frontend
1. Open http://localhost:5173
2. You should see Login page
3. Try with demo credentials:
   - Email: demo@example.com
   - Password: password123

### Test 4: Check Database Tables
```bash
# For PostgreSQL:
psql -U postgres -d money_saver
\dt   # List all tables

# For SQLite:
sqlite3 database.db
.tables
```

---

## 📋 Database Management Commands

### Initialize Fresh Database
```bash
npm run db:init
```

### Add Demo Data
```bash
npm run db:seed
```

### Reset Everything (Delete All Data)
```bash
npm run db:drop    # Delete all tables
npm run db:init    # Create fresh tables
npm run db:seed    # Add demo data
```

Or in one command:
```bash
npm run db:reset
```

---

## 🔐 Security Checklist Before Production

- [ ] Change JWT_SECRET to something random and long (32+ characters)
- [ ] Use strong DATABASE_URL connection string from production database
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS on frontend
- [ ] Setup password hashing (bcryptjs already installed)
- [ ] Add rate limiting (already in index.ts)
- [ ] Setup API key authentication
- [ ] Add CSRF protection
- [ ] Enable database backups
- [ ] Setup error logging (Sentry)

---

## 🆘 Troubleshooting

### Error: "Cannot connect to database"
1. Check DATABASE_URL is correct
2. For Supabase: Verify password is correct (watch for special characters)
3. For PostgreSQL: Make sure PostgreSQL service is running
4. Test connection manually:
   ```bash
   psql postgresql://user:password@host:5432/database
   ```

### Error: "Tables already exist"
- This is OK! The script checks for existing tables
- If you want fresh tables: `npm run db:drop && npm run db:init`

### Error: "Permission denied"
- For PostgreSQL: Make sure you have admin rights
- For Linux/Mac: Use `sudo` if needed

### Frontend shows "Failed to fetch"
- Backend not running: `cd backend && npm run dev`
- Database not initialized: `npm run db:init`
- Check CORS configuration

### Demo login doesn't work
- Run: `npm run db:seed` to add demo user
- Or create new user via registration page

---

## 📊 What Gets Created

When you run `npm run db:init`, these tables are created:

- **users** - User accounts
- **transactions** - Income/Expense records
- **budgets** - Budget tracking
- **payments** - UPI payment history
- **bank_accounts** - Linked bank accounts
- **user_preferences** - User settings
- **refresh_tokens** - Session tokens

---

## ✅ Success!

You should now have:
- ✅ Database running
- ✅ Backend API connected to database
- ✅ Frontend running and connected to backend
- ✅ Real user authentication working
- ✅ Ready to customize and deploy!

---

## 🚀 Next Steps

1. **Customize user fields** - Edit database schema in `src/db/migrations.ts`
2. **Add more features** - Create new API endpoints
3. **Deploy** - Follow DEPLOYMENT.md guide
4. **Monitor** - Setup error logging and backups

Need help? Check the documentation in the project or create an issue on GitHub.

