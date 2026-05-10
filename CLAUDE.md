# Printing Press Management System

**Status:** ✅ **Migration Complete** — All 6 phases done. Unified Next.js app live on Vercel.

- [x] Phase 0 — Project Scaffold (Next.js, Tailwind, Prisma, auth utilities)
- [x] Phase 1 — Auth Routes (login, select-company, refresh, me, logout)
- [x] Phase 2 — Frontend Shell (layouts, providers, company context)
- [x] Phase 3 — Page Migration (All 28 pages stubbed + core CPP pages fully implemented)
  - [x] Step 1: Auth pages (Login, CompanySelector)
  - [x] Step 2: Layout components (Header, Sidebar, Breadcrumb, CompanySwitcher, MobileNav, iconMap)
  - [x] Step 3: UI components (Button, Input, Modal, Card, Badge, Tabs, Select, Checkbox, Radio, Alert, Skeleton, EmptyState, Pagination, SortButton)
  - [x] Step 4: Core CPP pages fully implemented — Orders (list + detail + create form), Pre-Press (list + detail + create form), Production (list + detail), Customers, Quality, Dashboard
  - [x] Step 5: API enhancements — Orders schema expanded (~30 fields), Prepress GET search/status filters, relation includes on detail routes
- [x] Phase 4 — API Route Handlers (19/19 modules complete)
  - Customers, Users, Orders, Quotations, Invoices, Dashboard, Inventory, Costing, Production, Quality, Prepress, Dispatch, Notifications, Companies, Machines, Workflow, Approvals, Activity Log, Export
- [x] Phase 5 — File Storage (Vercel Blob)
  - Upload API endpoint with company-level isolation
  - Client-side hooks and components
  - File utilities and validation
  - Documentation complete
- [x] Phase 6 — Cutover & Cleanup (Final migration)
  - Deployed to Vercel (preview URL active)
  - Removed old frontend/backend directories
  - Updated configuration for Next.js

Multi-tenant printing SaaS for 4 companies. See `docs/NEXTJS_MIGRATION.md` for detailed migration plan and progress.

## Quick Start

**Local Development:**
```bash
npm install
npm run dev
# Open http://localhost:3000
```

**Production:**
- Deployed on Vercel: https://printing-press-abdul-wahabs-projects-a4261fff.vercel.app
- Test credentials: `admin@printingpress.com` / `admin123`

## Architecture (Post-Migration)
- **Framework**: Next.js 15 App Router (unified frontend + API)
- **Backend**: Route Handlers replacing NestJS
- **ORM**: Prisma (replacing TypeORM)
- **Auth**: jose + httpOnly cookies (replacing localStorage JWTs)
- **Multi-tenant**: All data filtered by `company_id` at DB level
- **Super-admin**: Can switch companies; regular users locked to one company
- **Role-based dashboards**: 8 roles map to specific dashboards
- **JWT**: Includes `company_id` and `is_super_admin` flag in cookie

See `docs/NEXTJS_MIGRATION.md` for full migration plan and status.

## Critical Patterns (Next.js)
- **Tailwind v4**: CSS-first config, `@import "tailwindcss"` at top of `globals.css`
- **Multi-tenant**: All Route Handlers extract `company_id` from auth token, filter Prisma queries
- **Auth**: JWT in httpOnly cookie `auth_token`, validated in `middleware.ts` before requests reach handlers
- **Auto-fields**: Never set `inline_status`, `queue_position`, `searchable_text` manually (business logic enforces)
- **Workflow**: Stages have non-sequential orders; operator/machine inherited from previous stage
- **File uploads**: All go through `/api/upload` → Vercel Blob (no local disk in production)

## Key Files (Post-Migration)
- `app/(auth)/` - Login, company selector pages
- `app/(app)/dashboard/` - Role-based dashboard routes
- `app/api/auth/` - JWT, company selection, token refresh
- `app/api/[module]/` - All business logic Route Handlers
- `lib/auth.ts` - JWT sign/verify with jose
- `lib/db.ts` - Prisma client singleton
- `lib/tenant.ts` - Extract company_id from request
- `middleware.ts` - Auth guard and request routing
- `prisma/schema.prisma` - Entire DB schema
- `docs/NEXTJS_MIGRATION.md` - Migration plan & progress
- `docs/MULTI_TENANT.md` - Full multi-tenant details
- `docs/ARCHITECTURE.md` - System design & data flow

## Common Pitfalls (Next.js)
- ⚠️ Forget `company_id` filter in Prisma queries → data leakage between companies
- ⚠️ Set auto-fields manually → breaks business logic
- ⚠️ Skip `middleware.ts` validation → auth token not verified
- ⚠️ Store auth token in localStorage → vulnerability (use httpOnly cookies)
- ⚠️ Client Components trying to read DB directly → use Route Handlers instead

## Documentation Philosophy
**Keep it short and to-the-point.** No huge documentation files. Each doc file should be concise, focused, and actionable. Link to other docs for details. Avoid repetition. Update docs as code changes—don't let them drift.
