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

## Migration Phases

### Phase 0 — Project Scaffold
1. Create Next.js 15 app at repo root
2. Wire Tailwind v4, Prisma, auth skeleton
3. Copy Apple HIG tokens from `frontend/src/index.css`
4. Run `prisma db pull` to introspect existing DB schema

### Phase 1 — Auth Routes (2 days)
Replicate the two-phase JWT login flow as Route Handlers with httpOnly cookies:
- `POST /api/auth/login` → temp token
- `POST /api/auth/select-company` → full token with `company_id`
- `POST /api/auth/refresh`, `GET /api/auth/me`, `POST /api/auth/logout`

### Phase 2 — Frontend Shell (1 day)
- Root layout with providers (QueryClientProvider, CompanyProvider, Toaster)
- Auth-protected shell layout (Sidebar, Header, main)
- Port layout components from `frontend/src/components/layout/`

### Phase 3 — Page Migration (3 days)
- All 30 pages → `app/(app)/[module]/page.tsx`
- All components → `components/`
- Update imports: React Router → Next.js routing

### Phase 4 — API Route Handlers (7 days)
Replace NestJS modules with Route Handlers:
- Days 5–6: companies, users, customers, notifications
- Days 7–8: orders, quotations, dashboard
- Days 9–10: inventory, costing, invoices
- Days 11–12: production, prepress, quality, dispatch, workflow, export

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

See the full detailed plan at `/Users/apple/.claude/plans/shimmying-drifting-truffle.md`.
