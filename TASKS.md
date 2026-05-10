# PrintFlow — Task Tracker

**Updated:** 2026-05-10 | **Owner:** Abdul Ducker

---

## Status Legend
- `[ ]` Not started
- `[~]` In progress
- `[x]` Done — committed

---

## Phase 4 — Page Redesigns (Design System Plan)

### Task 1 — Commit new UI components ✅ done — `4b01927`
- [x] StatusPill, ConfirmDialog, NotificationBell, CompanyBadge, WorkflowTimeline
- [x] Header.tsx updated to use NotificationBell
- [x] components/ui/index.ts exports updated
**Files:** `components/ui/*.tsx`, `components/layout/Header.tsx`, `components/ui/index.ts`

---

### Task 2 — Production page redesign ✅ done — `10168f7`
- [x] Replace card list → horizontal `WorkflowTimeline` stepper
- [x] Stage cards: operator, machine, start time, elapsed time
- [x] Action buttons on active stage only (start / pause / complete / flag)
- [x] StatusPill for all status displays, all CSS variables (no hardcoded colors)
- [x] New `/api/production/[id]/stages/[stageId]` PATCH endpoint
**Files:** `app/(app)/production/page.tsx`, `app/(app)/production/[id]/page.tsx`

---

### Task 3 — Pre-Press page redesign ✅ done
- [x] Design list → card grid (thumbnail placeholder, StatusPill, age)
- [x] Design detail: split view (file preview left, approval thread right)
- [x] Spec form: tabbed sections (Basic → Printing → Finishing → Approvals)
**Files:** `app/(app)/prepress/page.tsx`, `app/(app)/prepress/[id]/page.tsx`, `app/(app)/prepress/new/page.tsx`

---

### Task 4 — Orders multi-step form
- [ ] Multi-step form (5 steps with progress bar)
  1. Basic Info (customer, dates, quantity)
  2. Product Specs (CPP cartons / product type)
  3. Printing (colors, plates, separation)
  4. Finishing (lamination, varnish, embossing)
  5. Review & Submit
- [ ] Auto-save draft on step change
**Files:** `app/(app)/orders/new/page.tsx`, `app/(app)/orders/page.tsx`

---

### Task 5 — Login page — CPP branded
- [ ] Company logo + cobalt blue brand panel
- [ ] Clean auth card layout
- [ ] Company selector: card grid (not dropdown) with logo + name
**Files:** `app/(auth)/login/page.tsx`

---

### Task 6 — Global: Replace window.confirm()
- [ ] Audit all pages for `window.confirm()` calls
- [ ] Replace each with `ConfirmDialog` component
**Files:** grep across `app/(app)/`

---

## Phase 5 — SILVO & Best Foil Themes

### Task 7 — Finalize company themes
- [ ] Verify SILVO token overrides (`[data-company="silvo"]`)
- [ ] Verify Best Foil token overrides (`[data-company="bestfoil"]`)
- [ ] Test company switcher — sidebar accent, header tint update on switch
**Files:** `app/globals.css`, `components/layout/CompanySwitcher.tsx`

---

## Done

| Task | Commit | Date |
|------|--------|------|
| Phase 0-3 Design System | f958683 | 2026-05-04 |
| Phase 4 API Handlers | f958683 | 2026-05-04 |
| Phase 5 File Storage | f958683 | 2026-05-04 |
| Phase 6 Cutover | f958683 | 2026-05-04 |
