# Printing Press Management System - Setup Guide

## Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL v15+
- npm or pnpm

### 1. Database Setup

**Option A: Using Docker (Recommended)**
```bash
cd backend
docker compose up -d
```

**Option B: Manual PostgreSQL**
1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE printing_press;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Build the application
npm run build

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

Backend will run at: `http://localhost:3000/api`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:5173`

### 4. Default Login

After running migrations, use these credentials:
- **Email:** admin@printingpress.com
- **Password:** admin123

⚠️ **Important:** Change the default password after first login!

## Database Migrations

The following migrations will be created:
1. Enable UUID extension
2. Create users table with default admin
3. Create customers table
4. Create orders table
5. Create production_jobs table
6. Create inventory tables (items + transactions)
7. Create job_costs table
8. Create invoices and invoice_items tables

## Project Structure

```
printing-press/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── migrations/   # Database migrations
│   │   ├── auth/         # Authentication
│   │   ├── users/        # User management
│   │   ├── customers/    # Customer management
│   │   ├── orders/       # Order management
│   │   ├── production/   # Production planning
│   │   ├── inventory/    # Inventory management
│   │   ├── costing/      # Job costing & invoicing
│   │   └── dashboard/    # Dashboard statistics
│   └── docker-compose.yml
│
└── frontend/             # React + Vite
    └── src/
        ├── components/   # UI components
        ├── pages/        # Page components
        ├── services/     # API services
        ├── hooks/        # Custom React hooks
        └── types/        # TypeScript types
```

## API Endpoints

### Authentication
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get current user
- POST `/api/auth/refresh` - Refresh token

### Customers
- GET `/api/customers` - List customers
- POST `/api/customers` - Create customer
- GET `/api/customers/:id` - Get customer
- PATCH `/api/customers/:id` - Update customer
- DELETE `/api/customers/:id` - Delete customer

### Orders
- GET `/api/orders` - List orders
- POST `/api/orders` - Create order
- GET `/api/orders/:id` - Get order
- PATCH `/api/orders/:id` - Update order
- PATCH `/api/orders/:id/status` - Update status
- DELETE `/api/orders/:id` - Cancel order

### Production
- GET `/api/production/jobs` - List jobs
- POST `/api/production/jobs` - Create job
- GET `/api/production/jobs/:id` - Get job
- PATCH `/api/production/jobs/:id` - Update job
- POST `/api/production/jobs/:id/start` - Start job
- POST `/api/production/jobs/:id/complete` - Complete job
- GET `/api/production/schedule` - Get schedule

### Inventory
- GET `/api/inventory/items` - List items
- POST `/api/inventory/items` - Create item
- GET `/api/inventory/items/low-stock` - Low stock items
- POST `/api/inventory/transactions` - Create transaction
- GET `/api/inventory/transactions` - List transactions

### Invoices
- GET `/api/invoices` - List invoices
- POST `/api/invoices` - Create invoice
- GET `/api/invoices/:id` - Get invoice
- POST `/api/invoices/:id/payment` - Record payment

### Dashboard
- GET `/api/dashboard/stats` - Get statistics
- GET `/api/dashboard/recent-orders` - Recent orders
- GET `/api/dashboard/production-status` - Production status
- GET `/api/dashboard/pending-deliveries` - Pending deliveries

## User Roles

- **Admin**: Full system access
- **Sales**: Customer and order management
- **Planner**: Production planning and scheduling
- **Accounts**: Job costing and invoicing
- **Inventory**: Inventory management

## Development

### Backend Commands
```bash
npm run start:dev      # Start with hot reload
npm run build          # Build for production
npm run start:prod     # Start production server
npm run migration:run  # Run migrations
npm run test           # Run tests
```

### Frontend Commands
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `.env` credentials
- Ensure database `printing_press` exists

### Migration Errors
- Make sure to build first: `npm run build`
- Check database connection
- Verify migrations haven't been run already

### Port Conflicts
- Backend default: 3000
- Frontend default: 5173
- Change in `.env` files if needed

## Next Steps

1. ✅ Run database migrations
2. ✅ Login with default admin account
3. ✅ Create additional users
4. ✅ Start adding customers and orders
5. 🔄 Implement remaining frontend pages
6. 🔄 Add PDF invoice generation
7. 🔄 Add unit tests
8. 🔄 Deploy to production

## Support

For issues or questions, refer to the project documentation or create an issue in the repository.
