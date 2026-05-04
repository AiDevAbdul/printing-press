# Migration Plan: NestJS + React/Vite → Single Next.js App

## Context

The project is migrating from a split-stack architecture to a unified Next.js application:

**Current:**
- `frontend/` — React 19 + Vite + React Router DOM 7 + TanStack Query 5 + Tailwind v4
- `backend/` — NestJS 11 + TypeORM + PostgreSQL (deployed on Render.com)

**Target:**
- Single **Next.js 15 App Router** at repo root
- Route Handlers replacing NestJS API
- Prisma replacing TypeORM
- httpOnly cookies replacing localStorage JWTs
- Single `npm run dev`, single `package.json`

---

## Recommended Stack

| Layer | Current | New |
|---|---|---|
| Framework | React 19 + React Router DOM 7 | **Next.js 15 App Router** |
| Bundler | Vite 6 | **Next.js (Turbopack)** |
| Backend | NestJS 11 | **Next.js Route Handlers** |
| ORM | TypeORM 0.3.28 | **Prisma** (introspected from existing DB) |
| Auth | Custom JWT + localStorage | **jose** (JWT) + **httpOnly cookies** |
| CSS | Tailwind v4 | Keep Tailwind v4 (Apple HIG tokens) |
| Data fetching | TanStack Query v5 + Axios | Keep TanStack Query v5 + `fetch` |
| Validation | Zod + class-validator | **Zod** only |
| Forms | useState manually | **react-hook-form + zod** |
| File storage | Local disk (`./uploads/`) | **Vercel Blob** |
| Toasts | react-hot-toast + sonner | **Sonner** only |
| Exports | ExcelJS in NestJS | ExcelJS in Route Handler |

---

## Approach: Clean Rewrite at Repo Root

- Build the full Next.js app (frontend + backend) completely before cutover
- Old `frontend/` and `backend/` directories remain untouched until new app fully works
- Run both apps in parallel for testing (`localhost:3000` = old NestJS, `localhost:3001` = new Next.js)
- Swap in one shot, then delete old code

---

## Migration Status

**Completed (3 of 6 phases):**
- ✅ Phase 0 — Project Scaffold
- ✅ Phase 1 — Auth Routes
- ✅ Phase 2 — Frontend Shell & Providers

**In Progress:**
- ⏳ Phase 3 — Migrate Pages (30 pages, 3 days)
- ⏳ Phase 4 — API Route Handlers (19 modules, 7 days)
- ⏳ Phase 5 — File Storage (1 day)
- ⏳ Phase 6 — Cutover (1 day)

**Commits:**
- `d9912c5` Phase 2: Frontend shell & providers
- `[previous]` Phase 0-1: Next.js scaffold, Tailwind HIG tokens, Prisma setup, auth routes

---

## Migration Phases (Detailed)

### Phase 0 — Project Scaffold ✅ DONE
1. ✅ Created Next.js 15 app at repo root
2. ✅ Wired Tailwind v4, Prisma, auth skeleton
3. ✅ Copied Apple HIG tokens from `frontend.old/src/index.css`
4. ✅ Ran `prisma db pull` to introspect existing DB schema (38 models)

### Phase 1 — Auth Routes ✅ DONE
Replicated the two-phase JWT login flow as Route Handlers with httpOnly cookies:
- ✅ `POST /api/auth/login` → temp token + companies list
- ✅ `POST /api/auth/select-company` → full token with `company_id`
- ✅ `POST /api/auth/refresh` → new access token
- ✅ `GET /api/auth/me` → current user info
- ✅ `POST /api/auth/logout` → clear cookies

**Key files:**
- `lib/auth.ts` — JWT sign/verify with jose, cookie setters
- `lib/tenant.ts` — extract company_id from request
- `middleware.ts` — auth validation, tenant context injection
- `app/api/auth/*` — all 5 Route Handlers

### Phase 2 — Frontend Shell ✅ DONE
- ✅ Root layout with providers (QueryClientProvider, CompanyProvider, Toaster)
- ✅ Auth-protected shell layout (Sidebar, Header placeholders, main)
- ✅ CompanyContext for company selection state
- ✅ Home page redirects to /login or /dashboard

**Key files:**
- `app/layout.tsx` — root layout
- `app/providers.tsx` — QueryClient + CompanyProvider + Toaster
- `app/(auth)/layout.tsx` — centered layout for login/company-selector
- `app/(app)/layout.tsx` — protected layout with sidebar+header structure
- `lib/company-context.tsx` — company selection context

### Phase 3 — Page Migration (3 days) ⏳ NEXT
**Goal:** All 30 pages migrated to App Router as `'use client'` components + layout components ported.

**Approach:**
1. Port pages from `frontend.old/src/pages/` → `app/(app)/[module]/page.tsx`
2. Port components from `frontend.old/src/components/` → `components/`
3. Update imports for Next.js (useRouter, Link, remove lazy)

**Import changes:**
```typescript
// React Router → Next.js
import { useNavigate } from 'react-router-dom' → import { useRouter } from 'next/navigation'
import { Link } from 'react-router-dom' → import Link from 'next/link'
<Link to="..."> → <Link href="...">
React.lazy() → Remove (Next.js handles code-splitting)
```

**Route mapping:**
```
/login → app/(auth)/login/page.tsx (keep auth layout)
/company-selector → app/(auth)/company-selector/page.tsx (keep auth layout)
/dashboard → app/(app)/dashboard/page.tsx
/dashboard/prepress → app/(app)/dashboard/prepress/page.tsx
/orders → app/(app)/orders/page.tsx
/workflow/:jobId → app/(app)/workflow/[jobId]/page.tsx
[...30 routes total]
```

**Known issues to fix during port:**
- `DispatchMetrics.tsx`: localStorage key `'token'` → `'access_token'`
- `ProductionWorkflowLevels.tsx`: direct localStorage → use CompanyContext

**Batch order (by complexity):**
1. **Auth** (2 pages): Login, CompanySelector — unblock user testing
2. **Dashboards** (8 pages): prepress, production, quality, sales, finance, inventory, analytics
3. **Features** (10 pages): orders, customers, quotations, planning, production, shop-floor, quality, dispatch, prepress, specifications
4. **Management** (10 pages): users, user-management, invoices, costing, wastage-analytics, qa-approval, workflow, profile, activity-log, notifications

### Phase 4 — API Route Handlers (7 days) ⏳ AFTER PHASE 3
**Goal:** Replace NestJS service logic with Next.js Route Handlers (one per module).

**Pattern for each Route Handler:**
```typescript
// app/api/[module]/[[...slug]]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/tenant'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { companyId } = await getTenantContext(req)
  const items = await db.[model].findMany({
    where: { company_id: companyId }
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const { companyId } = await getTenantContext(req)
  const data = await req.json()
  const item = await db.[model].create({
    data: { ...data, company_id: companyId }
  })
  return NextResponse.json(item, { status: 201 })
}
```

**Implementation order (simple → complex):**
- **Days 1–2:** companies, users, customers, notifications
- **Days 3–4:** orders, quotations, dashboard
- **Days 5–6:** inventory, costing, invoices
- **Days 7:** production, prepress, quality, dispatch, workflow, export (complex multi-step logic)

**Key files to reference:**
- `backend.old/src/*/services/*.ts` — NestJS service methods
- `backend.old/src/*/dtos/*.ts` — request/response shapes
- `backend.old/src/*/controllers/*.ts` — HTTP method patterns

**Multi-tenant pattern (apply everywhere):**
```typescript
const { companyId } = await getTenantContext(req)
// ALL queries must filter by company_id:
where: { company_id: companyId, ... }
```

### Phase 5 — File Storage (1 day)
Replace local disk `./uploads/` with Vercel Blob for quality photos, complaints, POD.

### Phase 6 — Cutover & Cleanup (1 day)
- Deploy to Vercel with new env vars (`DATABASE_URL`, `JWT_SECRET`, `BLOB_READ_WRITE_TOKEN`)
- Delete `frontend/` and `backend/` directories
- Remove `vercel.json` and `render.yaml`

---

## Key Design Decisions

**Auth Flow:** Two-phase JWT with httpOnly cookies
```
login() → auth_temp cookie (no company_id)
  ↓
selectCompany() → auth_token + auth_refresh cookies (with company_id)
  ↓
middleware.ts validates & injects context into Route Handlers
```

**Multi-Tenancy:** Manual discipline (kept from NestJS)
```typescript
// Every Route Handler:
const { companyId } = await getTenantContext(req)
await db.order.findMany({ where: { company_id: companyId } })
```

**File Uploads:** All go through `/api/upload` → Vercel Blob
- Quality defect photos, complaints, POD photos stored as public Blob URLs
- Existing records keep working via redirect until cutover

---

## Critical Files to Port

| Source | Destination |
|---|---|
| `frontend/src/index.css` | `app/globals.css` |
| `frontend/src/components/` | `components/` |
| `frontend/src/context/CompanyContext.tsx` | `lib/company-context.tsx` |
| `frontend/src/utils/dashboardRouter.ts` | `lib/dashboard-router.ts` |
| `frontend/src/hooks/`, `types/` | `hooks/`, `types/` |
| `backend/src/auth/strategies/jwt.strategy.ts` | `lib/auth.ts` (jose) |
| `backend/src/*/services/*.ts` | `app/api/*/route.ts` |
| All TypeORM entities | `prisma/schema.prisma` (auto-generated) |

---

## Verification Checklist

1. **Auth:** Login flow works (phase 1/2 JWT tokens)
2. **Multi-tenant isolation:** Data correctly scoped by company_id
3. **All 30 pages load** without errors
4. **CRUD flows:** Orders, quotations, production workflow
5. **File uploads:** Quality photos → Vercel Blob URLs
6. **Excel exports:** Wastage, quality analytics
7. **Build:** `npm run build` passes
8. **Deploy:** Production URL fully functional

---

---

## What's Ready to Use (Already Built)

**Auth system is complete:**
- JWT sign/verify with jose: `lib/auth.ts`
- Tenant context extraction: `lib/tenant.ts`
- Request middleware: `middleware.ts`
- All 5 auth routes: `app/api/auth/*`

**Frontend infrastructure:**
- Root layout with providers: `app/layout.tsx`
- Tailwind v4 + Apple HIG tokens: `app/globals.css`
- Company context: `lib/company-context.tsx`
- Auth-protected layout: `app/(app)/layout.tsx`
- Auth layout: `app/(auth)/layout.tsx`

**Database:**
- Prisma schema (38 models): `prisma/schema.prisma`
- Prisma Client ready to use: `lib/db.ts`

**Development environment:**
- `.env.local` with DATABASE_URL (Neon PostgreSQL)
- `package.json` with all dependencies installed
- TypeScript build passes

**Old code backed up:**
- `frontend.old/` — original React/Vite frontend (port pages from here)
- `backend.old/` — original NestJS backend (port services from here)

---

See the full detailed plan at `/Users/apple/.claude/plans/shimmying-drifting-truffle.md`.
