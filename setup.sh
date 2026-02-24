#!/bin/bash

# Printing Press Management System - Quick Start Script

echo "=================================="
echo "Printing Press Management System"
echo "Quick Start Setup"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

if ! command_exists psql; then
    echo "⚠️  PostgreSQL client not found. Make sure PostgreSQL is installed or use Docker."
fi

echo "✅ Prerequisites check passed"
echo ""

# Setup backend
echo "=================================="
echo "Setting up Backend..."
echo "=================================="
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please update with your database credentials if needed."
else
    echo "✅ .env file already exists"
fi

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    echo "✅ Backend dependencies installed"
else
    echo "✅ Backend dependencies already installed"
fi

echo "Building backend..."
npm run build
echo "✅ Backend built successfully"

echo ""
echo "=================================="
echo "Database Setup"
echo "=================================="
echo "Do you want to run database migrations now? (y/n)"
read -r run_migrations

if [ "$run_migrations" = "y" ] || [ "$run_migrations" = "Y" ]; then
    echo "Running migrations..."
    npm run migration:run
    echo "✅ Migrations completed"
    echo ""
    echo "Default admin user created:"
    echo "  Email: admin@printingpress.com"
    echo "  Password: admin123"
    echo "  ⚠️  Please change this password after first login!"
else
    echo "⚠️  Skipping migrations. Run 'npm run migration:run' in the backend directory later."
fi

cd ..

# Setup frontend
echo ""
echo "=================================="
echo "Setting up Frontend..."
echo "=================================="
cd frontend

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

cd ..

# Final instructions
echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "To start the application:"
echo ""
echo "1. Start PostgreSQL (if not using Docker):"
echo "   cd backend && docker compose up -d"
echo ""
echo "2. Start the backend (in one terminal):"
echo "   cd backend && npm run start:dev"
echo "   Backend will run at: http://localhost:3000/api"
echo ""
echo "3. Start the frontend (in another terminal):"
echo "   cd frontend && npm run dev"
echo "   Frontend will run at: http://localhost:5173"
echo ""
echo "4. Login with:"
echo "   Email: admin@printingpress.com"
echo "   Password: admin123"
echo ""
echo "=================================="
echo "Happy coding! 🚀"
echo "=================================="
