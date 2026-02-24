# Printing Press Management System

A comprehensive management system for packaging/printing companies built with NestJS and React.

## Project Structure

```
printing-press/
├── backend/          # NestJS backend API
└── frontend/         # React frontend (to be implemented)
```

## Backend Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- npm or pnpm

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your database connection:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=printing_press

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRATION=7d

PORT=3000
NODE_ENV=development
```

4. Set up PostgreSQL database:

**Option A: Using Docker (recommended)**
```bash
docker compose up -d
```

**Option B: Manual PostgreSQL setup**
- Install PostgreSQL on your system
- Create a database named `printing_press`
- Update the `.env` file with your PostgreSQL credentials

5. Build the application:
```bash
npm run build
```

6. Run database migrations (after implementing them):
```bash
npm run migration:run
```

7. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`

## Backend Modules

### Implemented Modules

1. **Authentication** (`/api/auth`)
   - JWT-based authentication
   - Login, logout, token refresh
   - Role-based access control

2. **Users** (`/api/users`)
   - User management
   - Roles: admin, sales, planner, accounts, inventory

3. **Customers** (`/api/customers`)
   - Customer CRUD operations
   - Search and pagination
   - Credit limit tracking

4. **Orders** (`/api/orders`)
   - Order management
   - Status workflow tracking
   - Product specifications

5. **Production** (`/api/production`)
   - Production job scheduling
   - Machine and operator assignment
   - Job status tracking

6. **Inventory** (`/api/inventory`)
   - Inventory item management
   - Stock transactions
   - Low stock alerts

7. **Costing** (`/api/costing`)
   - Job cost tracking
   - Material, labor, machine costs

8. **Invoices** (`/api/invoices`)
   - Invoice generation
   - Payment tracking
   - GST calculation

9. **Dashboard** (`/api/dashboard`)
   - Statistics and metrics
   - Recent orders
   - Production status

## API Documentation

Once the server is running, API documentation will be available at:
- Swagger UI: `http://localhost:3000/api/docs` (to be implemented)

## User Roles & Permissions

- **Admin**: Full access to all modules
- **Sales**: Customer and order management
- **Planner**: Production planning and scheduling
- **Accounts**: Job costing and invoicing
- **Inventory**: Inventory management

## Development

### Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run build` - Build the application
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage

### Database Migrations

Generate a new migration:
```bash
npm run migration:generate -- src/migrations/MigrationName
```

Run migrations:
```bash
npm run migration:run
```

Revert last migration:
```bash
npm run migration:revert
```

## Technology Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator

### Frontend (To be implemented)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: React Query (TanStack Query)

## Next Steps

1. Create database migrations for all entities
2. Implement frontend with React and Vite
3. Add Swagger/OpenAPI documentation
4. Implement unit and integration tests
5. Add PDF generation for invoices
6. Deploy to production environment

## License

ISC
