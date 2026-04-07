# CLAUDE.md

Printing Press Management System - NestJS backend + React frontend for packaging/printing companies.

## Multi-Company System ✅ COMPLETE

This is a **multi-tenant application** serving 4 printing companies:
1. Capital Packages
2. CPP Pre Press
3. BEST FOIL
4. SILVO Enterprises

**Key Architecture**:
- Single admin account (`admin@printingpress.com` / `admin123`) is a super-admin with access to all companies
- Super-admin users can switch between companies via header switcher
- Regular users belong to exactly one company (composite unique constraint on email + company_id)
- All data filtered by `company_id` at database level
- Super-admin sees company selector after login; regular users go directly to role-based dashboard
- Company switcher in header (only visible to super-admin)
- JWT payload includes `company_id` and `is_super_admin` for secure filtering

**For detailed multi-company documentation**, see:
- `docs/MULTI_COMPANY_IMPLEMENTATION.md` - Full technical implementation details
- `docs/MULTI_COMPANY_STATUS.md` - Status report and testing checklist
- `docs/QUICK_REFERENCE.md` - Quick start guide and troubleshooting

## Role-Based Dashboard System ✅ COMPLETE

**Login Flow**:
- Super-admin users → Company selector page (can switch companies)
- Regular users → Role-specific dashboard (locked to assigned company)

**Role-to-Dashboard Mapping**:
- `prepress` → `/dashboard/prepress` - Design stats, pending approvals
- `operator` → `/dashboard/production` - Job status, machine utilization
- `planner` → `/dashboard/production` - Production planning and workflow
- `qa_manager` → `/dashboard/quality` - QA metrics, defect rates, inspections
- `sales` → `/dashboard/sales` - Order pipeline, quotation status, customer metrics
- `analyst` → `/dashboard/analytics` - General analytics and reporting
- `accounts` → `/dashboard/finance` - Invoice status, payment tracking, revenue
- `inventory` → `/dashboard/inventory` - Stock levels, reorder alerts, material usage
- `admin` → `/dashboard` - Generic dashboard (or super-admin dashboard)

**Super-Admin Features**:
- Access all companies via company switcher in header
- Can select any company without restrictions
- Sees all navigation sections
- User management access

**Regular User Features**:
- Locked to assigned company (cannot switch)
- Role-specific navigation (only relevant sections visible)
- Role-specific dashboard with relevant metrics
- Company name displayed as read-only in header

**Backend Implementation**:
- `is_super_admin` boolean field on User entity (default: false)
- Migration: `1712426000000-AddSuperAdminToUsers.ts`
- Auth service validates super-admin status for company selection
- JWT payload includes `is_super_admin` flag
- `getUserCompanies()` returns all companies for super-admin, single company for regular users

**Frontend Implementation**:
- 7 role-based dashboard pages in `frontend/src/pages/dashboards/`
- Dashboard router utility: `frontend/src/utils/dashboardRouter.ts`
- Login page redirects based on `is_super_admin` flag
- Layout component filters navigation by user role
- CompanySwitcher only shows for super-admin users

## Critical Non-Standard Patterns

**Tailwind CSS v4 Setup** (breaks if wrong):
- Uses `@tailwindcss/vite` plugin (NOT PostCSS)
- `index.css` uses `@import "tailwindcss";` (NOT `@tailwind` directives)
- No tailwind.config.js needed

**Role-Based Dashboard System**:
- Super-admin flag (`is_super_admin`) determines access level
- Login redirects based on user type (super-admin → company selector, regular user → role dashboard)
- Dashboard routes are role-specific: `/dashboard/prepress`, `/dashboard/production`, etc.
- Navigation is filtered by role in Layout component
- Company switcher only visible to super-admin users
- Regular users see read-only company name in header

**Backend**:
- Global API prefix: `/api` (all routes)
- TypeORM `synchronize: false` - always use migrations
- Roles: `admin`, `sales`, `planner`, `accounts`, `inventory`, `qa_manager`, `operator`, `analyst`
- Default admin: `admin@printingpress.com` / `admin123` (super-admin with `is_super_admin = true`)
- **Multi-tenant**: All queries must filter by `company_id` from JWT payload
- **Super-Admin**: Can access any company; regular users locked to their company

**Frontend**:
- All API requests automatically include `X-Company-ID` header via interceptor
- Company selection stored in localStorage
- CompanyContext provides global company state
- `useAuth()` hook includes `isSuperAdmin` flag
- Dashboard router utility maps roles to dashboard routes

## Common Pitfalls

**Auto-Generated Fields** (never set manually):
- `inline_status` - auto-updates from stage/process/machine
- `queue_position` - auto-recalculates on status changes
- `searchable_text` - auto-updates from job details

**Production Workflow**:
- Workflow stages have **non-sequential orders** (1,2,3,4,8,10,11) due to optional stages
- Backend automatically **inherits operator and machine** from previous completed stage if not assigned
- `operator_id` is a UUID string (NOT a number) - User IDs are UUIDs
- Stage progression uses `stage_order` comparison, NOT `stage_order + 1` (handles gaps)
- Frontend sends empty string for operator_id if not available - backend handles inheritance

**Multi-Company Data Isolation**:
- ⚠️ CRITICAL: All service methods must accept `companyId` parameter
- ⚠️ All queries must filter by `company_id` to prevent data leakage
- ⚠️ Controllers must extract `user.company_id` from `@CurrentUser()` and pass to services
- ⚠️ Frontend must send `X-Company-ID` header with all requests

## Database Migrations

**Multi-Company Migrations** (run in order):
1. `1712425200000-CreateCompaniesTable.ts` - Creates companies table with 4 companies
2. `1712425300000-AddCompanyIdToUsers.ts` - Adds company_id to users
3. `1712425400000-AddCompanyIdToEntities.ts` - Adds company_id to core entities
4. `1712425500000-AddCompanyIdToDependentEntities.ts` - Adds company_id to dependent tables

Run migrations with: `npm run typeorm migration:run`

## Authentication Flow

**Login**:
```
POST /api/auth/login
→ Returns: access_token, refresh_token, user (with is_super_admin flag), companies[]
→ Frontend checks is_super_admin:
  - If true: redirect to /company-selector
  - If false: redirect to role-based dashboard (e.g., /dashboard/prepress)
```

**Company Selection** (Super-Admin Only):
```
POST /api/auth/select-company { company_id }
→ Super-admin can select ANY company
→ Returns: access_token, refresh_token with company_id in JWT
→ Frontend stores tokens and company_id
→ Redirects to /dashboard
```

**Company Switching** (Super-Admin Only):
```
Click company switcher in header
→ POST /api/auth/select-company { company_id }
→ Page reloads with new company context
→ All data filtered by new company_id
```

**All Requests**:
```
Header: Authorization: Bearer <token>
Header: X-Company-ID: <company_id>
→ Backend filters all queries by company_id
→ JWT includes is_super_admin for authorization checks
```

## Documentation

Start with `docs/README.md` for navigation to all documentation.

**Multi-Company Specific**:
- `docs/MULTI_COMPANY_IMPLEMENTATION.md` - Complete technical details
- `docs/MULTI_COMPANY_STATUS.md` - Implementation status and testing
- `docs/QUICK_REFERENCE.md` - Quick reference and troubleshooting

## File Organization Rules

⚠️ **IMPORTANT**: Never save .md files in the root directory except for `CLAUDE.md`. All documentation files must go in the `docs/` directory to keep the root clean and organized.

