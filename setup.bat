@echo off
REM Printing Press Management System - Quick Start Script (Windows)

echo ==================================
echo Printing Press Management System
echo Quick Start Setup
echo ==================================
echo.

REM Check if we're in the right directory
if not exist "backend" (
    echo Error: backend directory not found
    echo Please run this script from the project root directory
    exit /b 1
)

if not exist "frontend" (
    echo Error: frontend directory not found
    echo Please run this script from the project root directory
    exit /b 1
)

REM Check prerequisites
echo Checking prerequisites...
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install Node.js v18 or higher.
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed. Please install npm.
    exit /b 1
)

echo Prerequisites check passed
echo.

REM Setup backend
echo ==================================
echo Setting up Backend...
echo ==================================
cd backend

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo .env file created. Please update with your database credentials if needed.
) else (
    echo .env file already exists
)

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    echo Backend dependencies installed
) else (
    echo Backend dependencies already installed
)

echo Building backend...
call npm run build
echo Backend built successfully

echo.
echo ==================================
echo Database Setup
echo ==================================
set /p run_migrations="Do you want to run database migrations now? (y/n): "

if /i "%run_migrations%"=="y" (
    echo Running migrations...
    call npm run migration:run
    echo Migrations completed
    echo.
    echo Default admin user created:
    echo   Email: admin@printingpress.com
    echo   Password: admin123
    echo   WARNING: Please change this password after first login!
) else (
    echo Skipping migrations. Run 'npm run migration:run' in the backend directory later.
)

cd ..

REM Setup frontend
echo.
echo ==================================
echo Setting up Frontend...
echo ==================================
cd frontend

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo .env file created
) else (
    echo .env file already exists
)

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    echo Frontend dependencies installed
) else (
    echo Frontend dependencies already installed
)

cd ..

REM Final instructions
echo.
echo ==================================
echo Setup Complete!
echo ==================================
echo.
echo To start the application:
echo.
echo 1. Start PostgreSQL (if not using Docker):
echo    cd backend ^&^& docker compose up -d
echo.
echo 2. Start the backend (in one terminal):
echo    cd backend ^&^& npm run start:dev
echo    Backend will run at: http://localhost:3000/api
echo.
echo 3. Start the frontend (in another terminal):
echo    cd frontend ^&^& npm run dev
echo    Frontend will run at: http://localhost:5173
echo.
echo 4. Login with:
echo    Email: admin@printingpress.com
echo    Password: admin123
echo.
echo ==================================
echo Happy coding! 🚀
echo ==================================
echo.
pause
