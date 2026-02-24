# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack Printing Press Management System with NestJS backend and React frontend. The system manages customers, orders, production jobs, inventory, costing, invoicing, and user management for packaging/printing companies.

## Development Commands

### Running the Application

```bash
# Run both backend and frontend concurrently (from root)
npm start

# Backend only (from backend/)
npm run start:dev          # Development with hot reload
npm run start:debug        # Debug mode
npm run build              # Production build
npm run start:prod         # Production mode

# Frontend only (from frontend/)
npm run dev                # Development server (Vite)
npm run build              # Production build
npm run preview            # Preview production build
```

### Database Operations

```bash
# From backend/ directory
npm run migration:run      # Run pending migrations
npm run migration:revert   # Revert last migration
npm run migration:generate -- src/migrations/MigrationName  # Generate new migration
```

**Important**: Always run migrations after pulling changes that include new database schema modifications.

### Testing

```bash
# Backend tests (from backend/)
npm test                   # Run all tests
npm run test:watch         # Watch mode
npm run test:cov           # With coverage
npm run test:e2e           # End-to-end tests
```

## Architecture

### Backend (NestJS + TypeORM + PostgreSQL)

**Module Structure**: Each business domain is a self-contained NestJS module with:
- `*.entity.ts` - TypeORM entities (database models)
- `*.dto.ts` - Data Transfer Objects for validation (class-validator)
- `*.service.ts` - Business logic
- `*.controller.ts` - HTTP endpoints with guards

**Key Architectural Patterns**:

1. **Global API Prefix**: All backend routes are prefixed with `/api` (configured in `main.ts`)

2. **Authentication Flow**:
   - JWT-based with access tokens (1h) and refresh tokens (7d)
   - Guards: `JwtAuthGuard` for authentication, `RolesGuard` for authorization
   - Roles: `admin`, `sales`, `planner`, `accounts`, `inventory`
   - Use `@Roles()` decorator to restrict endpoints

3. **Database Configuration**:
   - TypeORM with PostgreSQL
   - `synchronize: false` - migrations are required for schema changes
   - Entities auto-loaded from `dist/**/*.entity.js`
   - Connection config in `backend/src/config/database.config.ts`

4. **Validation**:
   - DTOs use `class-validator` decorators
   - `class-transformer` for type conversion (e.g., `@Type(() => Date)` for date fields)
   - Global validation pipe enabled in `main.ts`

### Frontend (React + Vite + Tailwind CSS v4)

**Key Architectural Patterns**:

1. **Tailwind CSS v4 Setup**:
   - Uses `@tailwindcss/vite` plugin (NOT PostCSS)
   - `index.css` uses `@import "tailwindcss";` syntax (NOT `@tailwind` directives)
   - No `tailwind.config.js` or `postcss.config.js` needed

2. **API Communication**:
   - Centralized axios instance in `frontend/src/services/api.ts`
   - Automatic JWT token injection via interceptors
   - Auto token refresh on 401 errors
   - Base URL: `http://localhost:3000/api`

3. **State Management**:
   - React Query (TanStack Query) for server state
   - `useQuery` for fetching, `useMutation` for mutations
   - Query invalidation pattern: `queryClient.invalidateQueries({ queryKey: ['resource'] })`

4. **Routing**:
   - React Router v7
   - `PrivateRoute` wrapper checks authentication before rendering
   - Layout component wraps all authenticated routes

5. **Form Handling**:
   - Modal-based forms for create operations
   - All numeric fields must be explicitly converted: `Number(value)`
   - Date fields must be converted to ISO strings: `new Date(dateString).toISOString()`

## Critical Implementation Details

### Backend DTOs and Validation

When creating/updating entities, pay attention to:

1. **Field Name Mismatches**:
   - Customers: backend expects `postal_code`, not `pincode`
   - Orders: requires both `order_date` and `delivery_date` as Date objects
   - Production: dates must be Date objects, not strings

2. **Required vs Optional Fields**:
   - Check DTO decorators: `@IsOptional()` means field is optional
   - UUIDs must be valid: use `@IsUUID()` validation

3. **Nested Objects**:
   - Invoices require `items` array with `InvoiceItemDto[]`
   - Each item needs: `description`, `quantity`, `unit_price`

### Frontend Form Submissions

**Common Pitfalls**:

1. **Type Coercion**: HTML input type="number" returns strings. Always convert:
   ```typescript
   quantity: Number(formData.quantity)
   ```

2. **Date Handling**: Backend expects ISO date strings:
   ```typescript
   order_date: new Date(formData.order_date).toISOString()
   ```

3. **Response Structure**: Backend returns `{ data: [], total: 0 }`, not just arrays:
   ```typescript
   const items = response?.data || [];  // NOT: response || []
   ```

4. **Customer ID in Invoices**: Must extract from order's customer relationship:
   ```typescript
   customer_id: selectedOrder.customer_id || selectedOrder.customer?.id
   ```

### Authentication & Authorization

**Backend**:
- Admin-only endpoints: Users, Invoice creation, Job cost management
- Use `@Roles(UserRole.ADMIN, UserRole.ACCOUNTS)` for multi-role access
- Default admin user: `admin@printingpress.com` / `admin123`

**Frontend**:
- Tokens stored in localStorage: `access_token`, `refresh_token`, `user`
- Auto-redirect to `/login` on auth failure
- User role displayed in sidebar

## Module Relationships

```
Orders → Production Jobs → Job Costs
  ↓           ↓
Customers   Invoices

Inventory Items ← Job Costs (material type)
```

**Key Dependencies**:
- Production jobs require approved orders
- Invoices require orders (typically completed)
- Job costs link to production jobs and optionally inventory items
- All entities link to customers through orders

## Database Schema Notes

- All IDs are UUIDs
- Timestamps: `created_at`, `updated_at` (auto-managed)
- Soft deletes not implemented (use `is_active` flags where needed)
- Decimal fields use `precision: 10, scale: 2` for currency

## Environment Variables

**Backend** (`.env`):
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=printing_press
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRATION=7d
PORT=3000
NODE_ENV=development
```

**Frontend** (`.env`):
```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Common Issues & Solutions

1. **PostgreSQL Port Conflict**: If local PostgreSQL conflicts with Docker, kill local process:
   ```bash
   taskkill //F //IM postgres.exe  # Windows
   ```

2. **Migration Errors**: Ensure database is running and `.env` is configured before running migrations.

3. **Tailwind Not Working**: Verify using `@tailwindcss/vite` plugin and `@import "tailwindcss";` syntax (v4).

4. **401 Errors**: Clear localStorage and re-login to get fresh tokens.

5. **Form Validation Errors**: Check browser console for exact validation messages from backend.
