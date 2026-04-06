# CLAUDE.md

Printing Press Management System - NestJS backend + React frontend for packaging/printing companies.

## Multi-Company System ✅ COMPLETE

This is a **multi-tenant application** serving 4 printing companies:
1. Capital Packages
2. CPP Pre Press
3. BEST FOIL
4. SILVO Enterprises

**Key Architecture**:
- Single admin account (`admin@printingpress.com` / `admin123`) can access any company
- Users belong to exactly one company (composite unique constraint on email + company_id)
- All data filtered by `company_id` at database level
- Company selector page after login (separate page, not modal)
- Company switcher in header allows switching without logout
- JWT payload includes `company_id` for secure filtering

**For detailed multi-company documentation**, see:
- `docs/MULTI_COMPANY_IMPLEMENTATION.md` - Full technical implementation details
- `docs/MULTI_COMPANY_STATUS.md` - Status report and testing checklist
- `docs/QUICK_REFERENCE.md` - Quick start guide and troubleshooting

## Critical Non-Standard Patterns

**Tailwind CSS v4 Setup** (breaks if wrong):
- Uses `@tailwindcss/vite` plugin (NOT PostCSS)
- `index.css` uses `@import "tailwindcss";` (NOT `@tailwind` directives)
- No tailwind.config.js needed

**Backend**:
- Global API prefix: `/api` (all routes)
- TypeORM `synchronize: false` - always use migrations
- Roles: `admin`, `sales`, `planner`, `accounts`, `inventory`, `qa_manager`, `operator`, `analyst`
- Default admin: `admin@printingpress.com` / `admin123`
- **Multi-tenant**: All queries must filter by `company_id` from JWT payload

**Frontend**:
- All API requests automatically include `X-Company-ID` header via interceptor
- Company selection stored in localStorage
- CompanyContext provides global company state

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
→ Returns: access_token, refresh_token, user, companies[]
→ Frontend shows CompanySelector page
```

**Company Selection**:
```
POST /api/auth/select-company { company_id }
→ Returns: access_token, refresh_token with company_id in JWT
→ Frontend stores tokens and company_id
→ Redirects to dashboard
```

**All Requests**:
```
Header: Authorization: Bearer <token>
Header: X-Company-ID: <company_id>
→ Backend filters all queries by company_id
```

## Documentation

Start with `docs/README.md` for navigation to all documentation.

**Multi-Company Specific**:
- `docs/MULTI_COMPANY_IMPLEMENTATION.md` - Complete technical details
- `docs/MULTI_COMPANY_STATUS.md` - Implementation status and testing
- `docs/QUICK_REFERENCE.md` - Quick reference and troubleshooting

## File Organization Rules

⚠️ **IMPORTANT**: Never save .md files in the root directory except for `CLAUDE.md`. All documentation files must go in the `docs/` directory to keep the root clean and organized.

