# Next.js Migration Handoff

## Current Status: Phases 0-2 Complete ✅

The foundation is ready. Next task: **Phase 3 — Migrate 30 Pages** (3 days of work)

---

## What's Built (Use These)

### Auth System (Complete)
- JWT utilities: `lib/auth.ts` (sign, verify, refresh)
- Tenant context: `lib/tenant.ts` (getCompanyId, getTenantContext)
- 5 auth routes: `app/api/auth/login`, `/select-company`, `/refresh`, `/me`, `/logout`
- Auth middleware: `middleware.ts` (validates JWT, redirects to /login)

### Frontend Infrastructure (Complete)
- Root layout with providers: `app/layout.tsx`
- Company context: `lib/company-context.tsx`
- Protected layout: `app/(app)/layout.tsx` (has sidebar+header placeholders)
- Auth layout: `app/(auth)/layout.tsx` (centered card layout)
- Tailwind v4 + Apple HIG tokens: `app/globals.css`

### Database (Complete)
- Prisma schema: `prisma/schema.prisma` (38 models introspected)
- DB client: `lib/db.ts` (singleton pattern)
- Connection: `.env.local` has DATABASE_URL (Neon PostgreSQL)

### Dev Environment
- `npm run dev` — starts Next.js on localhost:3000
- `npm run build` — passes TypeScript checks
- All dependencies installed (jose, @tanstack/react-query, sonner, etc.)

---

## Phase 3: What to Do

**Goal:** Migrate 30 pages from `frontend.old/` to `app/(app)/` as Client Components

### Step 1: Port 2 Auth Pages (Unblock Testing)
```
frontend.old/src/pages/auth/Login.tsx → app/(auth)/login/page.tsx
frontend.old/src/pages/auth/CompanySelector.tsx → app/(auth)/company-selector/page.tsx
```
These pages will use the auth routes already built. Test login flow.

### Step 2: Port Layout Components (10 files)
Copy from `frontend.old/src/components/layout/`:
- Header.tsx
- Sidebar.tsx
- Layout.tsx
- MobileNav.tsx
- CompanySwitcher.tsx
- Breadcrumb.tsx
- etc.

Add `'use client'` at the top of each.

### Step 3: Port Other Components (20+ files)
Copy from `frontend.old/src/components/`:
- ui/ (Button, Input, Modal, Badge, Tabs, Card, etc.)
- dashboard/ (StatCard, RevenueWave, etc.)
- workflow/ (ExpandableJobRow, Timeline, etc.)
- orders/, invoices/, quality/, etc.

Add `'use client'` at the top of each.

### Step 4: Port Remaining 28 Pages
One by one, in this order:
1. Dashboards (8): prepress, production, quality, sales, finance, inventory, analytics
2. Features (10): orders, customers, quotations, planning, production, shop-floor, quality, dispatch, prepress, specifications
3. Management (10): users, user-management, invoices, costing, wastage-analytics, qa-approval, workflow, profile, activity-log, notifications

### Import Changes Required
```typescript
// OLD (Vite + React Router)
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Lazy, lazy, Suspense } from 'react'

// NEW (Next.js)
import { useRouter } from 'next/navigation'
import Link from 'next/link'
// Remove React.lazy() — Next.js code-splits automatically
```

### Route Mapping
```
/login → app/(auth)/login/page.tsx
/company-selector → app/(auth)/company-selector/page.tsx
/dashboard → app/(app)/dashboard/page.tsx
/dashboard/prepress → app/(app)/dashboard/prepress/page.tsx
/orders → app/(app)/orders/page.tsx
/workflow/:jobId → app/(app)/workflow/[jobId]/page.tsx
(etc. — map all 30 routes)
```

### Known Bugs to Fix
- `DispatchMetrics.tsx`: localStorage key `'token'` → `'access_token'`
- `ProductionWorkflowLevels.tsx`: direct localStorage → use CompanyContext

---

## What NOT to Do Yet

- ❌ Don't create auth pages yet (wait until layout components are ready)
- ❌ Don't build API Route Handlers (Phase 4 — comes after)
- ❌ Don't modify old backend/frontend code (just port it)
- ❌ Don't delete old frontend.old/ or backend.old/ (keep for reference)

---

## Testing as You Go

```bash
npm run dev
# Opens localhost:3000

# Try:
# 1. Navigate to /login
# 2. Check that auth layout is correct (centered)
# 3. Once auth pages are ported: test login flow
# 4. Once dashboards are ported: test sidebar/header
# 5. Once all pages ported: verify all routes work
```

---

## Build & Commit

After each batch of pages:
```bash
npm run build  # Must pass TS checks
git add -A
git commit -m "Port [batch] pages to Next.js App Router

- Ported [N] pages from React Router to Next.js
- Updated imports (useRouter, Link, etc.)
- Added 'use client' directives
- Build passes TypeScript checks

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Reference Files

- **Migration plan:** `docs/NEXTJS_MIGRATION.md` (detailed, updated)
- **Original plan:** `/Users/apple/.claude/plans/shimmying-drifting-truffle.md`
- **Source pages:** `frontend.old/src/pages/` (what to port FROM)
- **Source components:** `frontend.old/src/components/` (what to port FROM)
- **Target structure:** `app/(app)/` (where they go TO)

---

## Next Context Checklist

When starting Phase 3:
- [ ] Read `docs/NEXTJS_MIGRATION.md` for context
- [ ] Check current git log: `git log --oneline -5`
- [ ] Verify build: `npm run build`
- [ ] Start with auth pages (Login, CompanySelector)
- [ ] Port layout components next
- [ ] Then port remaining 28 pages in batches

Good luck! This is volume work but straightforward — just copy, update imports, add `'use client'`, and test.
