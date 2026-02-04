# 🚀 Deploy Money Saving App to Railway (FREE & EASY)

## ⚡ Quick 5-Minute Deployment

### Step 1: Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** `money-saving-app`
3. **Make it public** (required for Railway)
4. **DO NOT** check "Add a README file"
5. Click **"Create repository"**

### Step 2: Connect & Push Code
```bash
# Your repository is already connected!
# Code is already pushed to: https://github.com/shivamdhiman17296-byte/money-saving-app
# ✅ Ready for Railway deployment!
```

### Step 3: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. **Sign up/Login** (use GitHub for easy login)
3. Click **"New Project"**
4. Click **"Deploy from GitHub repo"**
5. **Connect your GitHub account**
6. **Select** `money-saving-app` repository
7. **Railway auto-detects** both frontend & backend!

### Step 4: Add Database
1. In Railway dashboard, click your project
2. Click **"Add Database"** → **"PostgreSQL"**
3. Railway creates the database automatically
4. Copy the **DATABASE_URL** from database settings

### Step 5: Configure Environment Variables
In Railway project settings → **Variables**, add:

```
DATABASE_URL=postgresql://... (from step 4)
JWT_SECRET=0fb31fb48d0958d9b70c2332a25faf2158a971c6323cfd553927d236df44ebc4
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.up.railway.app
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 6: Initialize Database
In Railway project → **Variables**, temporarily add:
```
RUN_DB_INIT=true
```

This will run database migrations on next deploy.

### 🎉 You're Live!

**Your URLs:**
- **Frontend:** `https://money-saving-app.up.railway.app`
- **Backend:** `https://money-saving-app-backend.up.railway.app`

## 💰 Cost: FREE for Basic Usage
- **Railway:** Free tier includes 512MB RAM, 1GB disk
- **PostgreSQL:** Free tier included
- **Domain:** Free .up.railway.app subdomain

## 🔧 Troubleshooting

**Build fails?**
- Check Railway build logs
- Make sure all dependencies are in package.json

**Database connection fails?**
- Verify DATABASE_URL is correct
- Check Railway database is running

**Frontend can't connect to backend?**
- Update FRONTEND_URL in Railway variables
- Check CORS settings in backend

## 📞 Need Help?
Railway has excellent documentation and support!