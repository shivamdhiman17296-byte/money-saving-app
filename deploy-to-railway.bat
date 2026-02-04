@echo off
echo =========================================
echo  Money Saving App - Railway Deployment
echo =========================================
echo.

echo Step 1: Create GitHub Repository
echo 1. Go to https://github.com/new
echo 2. Repository name: money-saving-app
echo 3. Make it public
echo 4. DON'T initialize with README
echo 5. Click Create repository
echo.
echo Step 2: Connect to GitHub
echo Copy the repository URL and run:
echo git remote add origin https://github.com/YOUR_USERNAME/money-saving-app.git
echo git push -u origin main
echo.
echo Step 3: Deploy to Railway
echo 1. Go to https://railway.app
echo 2. Sign up/Login
echo 3. Click "New Project"
echo 4. Click "Deploy from GitHub repo"
echo 5. Connect your GitHub account
echo 6. Select "money-saving-app" repository
echo 7. Railway will auto-detect and deploy!
echo.
echo Step 4: Configure Database
echo In Railway dashboard:
echo 1. Click your project
echo 2. Add PostgreSQL database
echo 3. Copy DATABASE_URL
echo 4. Add environment variables in Railway
echo.
pause