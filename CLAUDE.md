# Printing Press Management System

**Status:** 🔄 **Phase 3 In Progress** — All 28 pages stubbed + Dashboard fully implemented

- [x] Phase 0 — Project Scaffold (Next.js, Tailwind, Prisma, auth utilities)
- [x] Phase 1 — Auth Routes (login, select-company, refresh, me, logout)
- [x] Phase 2 — Frontend Shell (layouts, providers, company context)
- 🔄 **Phase 3 — Page Migration** (Steps 1-4 in progress)
  - [x] Step 1: Auth pages (Login, CompanySelector)
  - [x] Step 2: Layout components (Header, Sidebar, Breadcrumb, CompanySwitcher, MobileNav, iconMap)
  - [x] Step 3: UI components (Button, Input, Modal, Card, Badge, Tabs, Select, Checkbox, Radio, Alert, Skeleton, EmptyState, Pagination, SortButton)
  - 🔄 Step 4: All 28 pages (1 fully implemented, 27 stubs with mapping guide)
- ⏳ Phase 4 — API Route Handlers (19 modules)
- ⏳ Phase 5 — File Storage (Vercel Blob)
- ⏳ Phase 6 — Cutover & Cleanup

Multi-tenant printing SaaS for 4 companies. See `docs/NEXTJS_MIGRATION.md` for detailed migration plan and progress.

## Quick Start (During Migration)

**Currently running as two separate apps:**
- **Old Frontend**: `npm run dev` in `frontend/` (port 5173)
- **Old Backend**: `npm run start:dev` in `backend/` (port 3000)
- **Admin creds**: `admin@printingpress.com` / `admin123`

**After migration (target):**
- Single `npm run dev` at repo root
- Single `package.json`
- Single Vercel deployment

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
