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

### Linting & Formatting

```bash
# Backend (from backend/)
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting

# Frontend (from frontend/)
npm run lint               # ESLint
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
   - React Hook Form with Zod validation
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
   - Orders: Only `customer_id`, `order_date`, `delivery_date`, `product_name`, `quantity`, and `unit` are required
   - All 30+ specification fields (colors, varnish, lamination, etc.) are optional

3. **Nested Objects**:
   - Invoices require `items` array with `InvoiceItemDto[]`
   - Each item needs: `description`, `quantity`, `unit_price`

4. **Enum Values**:
   - Order status: `pending`, `approved`, `in_production`, `completed`, `delivered`, `cancelled`
   - Product types: `cpp_carton`, `silvo_blister`, `bent_foil`, `alu_alu`
   - Varnish types: `water_base`, `duck`, `plain_uv`, `spot_uv`, `drip_off_uv`, `matt_uv`, `rough_uv`, `none`
   - Lamination types: `shine`, `matt`, `metalize`, `rainbow`, `none`

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

## Enhanced Order Management (Phase 1)

The order system supports 30+ specification fields with conditional rendering based on product type:

**Product Types**:
- `cpp_carton` - CPP Carton boxes
- `silvo_blister` - Silvo/Blister Foil (includes cylinder tracking)
- `bent_foil` - Bent Foil (includes thickness/tablet size)
- `alu_alu` - Alu-Alu (includes thickness/punch size)

**Key Features**:
- Multi-step order form (5 steps)
- Color management: CMYK + 4 Pantone colors (P1-P4)
- Varnish options: 8 types including UV variants
- Lamination: 5 types (shine, matt, metalize, rainbow, none)
- Pre-press tracking: CTP info, die types, plate references
- Design approval workflow with timestamps
- Repeat order functionality (links to previous orders)
- Conditional fields based on product type

**Order Entity Structure**:
- 60+ fields total (30+ are optional specifications)
- All dates use `@Type(() => Date)` transformation
- Enums for status, priority, product type, varnish, lamination
- Relations: `customer` (ManyToOne), `created_by` (ManyToOne)

## Enhanced Production Management (Phase 5)

The production system has been enhanced with queue management, inline status tracking, and stage history capabilities for real-time production monitoring.

**Key Features**:
- Queue management with automatic position tracking
- Inline status display showing current stage, process, and machine
- Stage history tracking with timeline and duration
- Advanced search and filtering (by stage, machine, operator, customer, product)
- Searchable text field for fast full-text search
- Progress percentage tracking

**ProductionJob Entity Structure**:
- 9 new tracking fields: `queue_position`, `current_stage`, `current_process`, `inline_status`, `searchable_text`, `estimated_start`, `estimated_completion`, `actual_completion`, `progress_percent`
- Searchable text combines: job number, order number, product name, customer name, stage, process, machine, operator name
- Inline status auto-generated in format: `[Stage] - [Process] on [Machine]`

**ProductionStageHistory Entity**:
- Tracks each production stage with start/end times and duration
- Fields: `job_id`, `stage`, `process`, `machine`, `operator_id`, `started_at`, `completed_at`, `duration_minutes`, `notes`
- Cascade delete with ProductionJob (ON DELETE CASCADE)
- Duration auto-calculated in minutes when stage completes

**Machine Naming Conventions**:
- Printing: HB1, HB2 (Heidelberg)
- Die Cutting: Dye 1, Dye 2
- UV Coating: UV#1, UV#2
- Lamination: LM-1, LM-2
- Embossing: Emboss-1

**Production Stages**:
- Pre-Press
- Printing (processes: Cyan, Magenta, Yellow, Black)
- Sorting
- UV Application (Spot UV, Full UV)
- Lamination (Shine, Matt, Metalize)
- Embossing
- Die-Cutting
- Pasting
- Final QA

**Queue Management**:
- Jobs created with status `queued` get automatic position assignment
- Queue positions recalculate when jobs start or are cancelled
- Position based on creation time (FIFO)
- Inline status shows: `"Queued (Position #1 of 5)"`

**Stage Tracking Workflow**:
1. Create job → status: `queued`, inline_status: `"Queued (Position #X)"`
2. Start job → status: `in_progress`, queue positions recalculate
3. Start stage → creates stage history entry, updates `current_stage`, `current_process`, inline_status: `"Printing - Cyan on HB1"`
4. Complete stage → marks stage as completed, calculates duration, clears current stage
5. Start next stage → auto-completes previous stage if still active
6. Complete job → status: `completed`, progress: 100%, inline_status: `"Completed - Ready for Delivery"`

**Key API Endpoints**:
- `GET /api/production/jobs` - Enhanced with filters: `?search=`, `?status=`, `?stage=`, `?machine=`, `?operator_id=`, `?customer=`, `?product=`
- `GET /api/production/queue` - Get all queued jobs with positions
- `POST /api/production/jobs/:id/start-stage` - Start new stage (body: `stage`, `process`, `machine`, `operator_id`)
- `POST /api/production/jobs/:id/complete-stage` - Complete current stage (body: `notes`, `waste_quantity`)
- `GET /api/production/jobs/:id/timeline` - Get full stage history

**Frontend Form Fields**:
- Required: `order_id`
- Optional: `scheduled_start_date`, `scheduled_end_date`, `assigned_machine`, `assigned_operator_id`, `estimated_hours`, `notes`
- Display fields: `inline_status`, `progress_percent`, `queue_position`, `current_stage`, `current_process`

**Important Notes**:
- Inline status is auto-generated, don't manually set it
- Starting a new stage auto-completes the previous stage if still active
- Queue positions auto-recalculate on status changes
- Searchable text is auto-updated when job details change
- Duration is calculated in minutes when stage completes

## Module Relationships

```
Orders → Production Jobs → Job Costs
  ↓           ↓              ↓
Customers   Invoices   ProductionStageHistory
                            ↓
                         Users (operators)

Inventory Items ← Job Costs (material type)
```

**Key Dependencies**:
- Production jobs require approved orders
- Invoices require orders (typically completed)
- Job costs link to production jobs and optionally inventory items
- ProductionStageHistory tracks each stage with operator and machine details
- All entities link to customers through orders
- Stage history has cascade delete relationship with production jobs

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

**Production Notes**:
- SSL is automatically enabled when `NODE_ENV=production` or when connecting to Neon (detected by hostname)
- Database config uses `ssl: { rejectUnauthorized: false }` for production
- Entities are loaded from `dist/**/*.entity.js` (compiled output)
- Migrations are loaded from `dist/migrations/*.js`

## Deployment

**Production Stack**:
- Database: Neon PostgreSQL (free tier)
- Backend: Render (free tier) - configured via `render.yaml`
- Frontend: Vercel (free tier) - configured via `vercel.json`

**Deployment Files**:
- `render.yaml`: Backend deployment config with auto-generated JWT secrets
- `vercel.json`: Frontend deployment config with build commands

**Important Deployment Notes**:
- Backend must be built before deployment: `npm run build` (creates `dist/` folder)
- Migrations must be run manually after first deployment
- SSL is auto-enabled for production environments
- CORS is enabled globally in `main.ts`

## Common Issues & Solutions

1. **PostgreSQL Port Conflict**: If local PostgreSQL conflicts with Docker, kill local process:
   ```bash
   taskkill //F //IM postgres.exe  # Windows
   ```

2. **Migration Errors**: Ensure database is running and `.env` is configured before running migrations.

3. **Tailwind Not Working**: Verify using `@tailwindcss/vite` plugin and `@import "tailwindcss";` syntax (v4).

4. **401 Errors**: Clear localStorage and re-login to get fresh tokens.

5. **Form Validation Errors**: Check browser console for exact validation messages from backend.

6. **Production SSL Errors**: Verify `NODE_ENV=production` is set and database host is correct.

7. **Build Failures**: Ensure TypeScript compiles without errors before deployment.

8. **Production Stage Tracking**: When starting a new stage, the previous stage is automatically completed. Don't manually complete stages before starting the next one unless you need to add specific notes or waste quantity.

9. **Queue Position Updates**: Queue positions are auto-calculated and should not be manually set. They recalculate when jobs change from QUEUED to IN_PROGRESS status.

10. **Inline Status Generation**: The `inline_status` field is auto-generated based on job state. Never manually set this field - it updates automatically when stage, process, or machine changes.
