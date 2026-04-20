# Printing Press Management System

Multi-tenant NestJS + React app for 4 printing companies. See `docs/README.md` for full documentation.

## Quick Start
- **Admin**: `admin@printingpress.com` / `admin123` (super-admin, access all companies)
- **Backend**: `npm run start:dev` (port 3000)
- **Frontend**: `npm run dev` (port 5173)
- **Migrations**: `npm run typeorm migration:run`

## Architecture
- **Multi-tenant**: All data filtered by `company_id` at DB level
- **Super-admin**: Can switch companies via header; regular users locked to one company
- **Role-based dashboards**: 8 roles map to specific dashboards (`/dashboard/prepress`, etc.)
- **JWT**: Includes `company_id` and `is_super_admin` flag

## Critical Patterns
- **Tailwind v4**: Uses `@tailwindcss/vite` + `@import "tailwindcss"` (no PostCSS)
- **Multi-tenant**: All service methods accept `companyId`; all queries filter by `company_id`
- **Auto-fields**: Never set `inline_status`, `queue_position`, `searchable_text` manually
- **Workflow**: Stages have non-sequential orders (1,2,3,4,8,10,11); operator/machine inherited from previous stage
- **Frontend**: All requests include `X-Company-ID` header via interceptor

## Key Files
- `backend/src/auth/` - JWT, company selection, super-admin logic
- `frontend/src/pages/dashboards/` - 7 role-based dashboard pages
- `frontend/src/utils/dashboardRouter.ts` - Role → dashboard mapping
- `docs/MULTI_TENANT.md` - Full multi-tenant details
- `docs/ARCHITECTURE.md` - System design & data flow

## Common Pitfalls
- ⚠️ Forget `company_id` filter → data leakage
- ⚠️ Set auto-fields manually → breaks calculations
- ⚠️ Wrong decorator order in DTOs → validation fails
- ⚠️ Missing `X-Company-ID` header → 401 errors

## Documentation Philosophy
**Keep it short and to-the-point.** No huge documentation files. Each doc file should be concise, focused, and actionable. Link to other docs for details. Avoid repetition. Update docs as code changes—don't let them drift.
