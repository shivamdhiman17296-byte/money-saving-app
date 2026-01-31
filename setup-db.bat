@echo off
REM Money Saver Database Setup Script for Windows

echo.
echo =========================================
echo  Money Saver - Database Setup
echo =========================================
echo.

REM Check if .env file exists
if not exist "backend\.env" (
    echo ⚠️  .env file not found!
    echo.
    echo Creating .env from .env.example...
    copy backend\.env.example backend\.env
    echo ✅ .env file created! 
    echo.
    echo 📝 Please edit backend\.env and add your database connection string:
    echo    DATABASE_URL=postgresql://user:password@host:5432/database
    echo.
    pause
) else (
    echo ✅ .env file found
)

echo.
echo Checking database connection...
cd backend
call npm run db:test
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Database connection failed!
    echo.
    echo Please ensure:
    echo   1. PostgreSQL/Supabase is running
    echo   2. DATABASE_URL in .env is correct
    echo   3. Database credentials are valid
    echo.
    pause
    exit /b 1
)

echo.
echo Initializing database tables...
call npm run db:init
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Database initialization failed!
    pause
    exit /b 1
)

echo.
echo ✅ Database setup complete!
echo.
echo Next steps:
echo   1. Start backend: npm run dev
echo   2. Start frontend: npm run dev (from frontend folder)
echo   3. Open http://localhost:5173
echo.
pause
cd ..
