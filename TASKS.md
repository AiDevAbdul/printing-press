# PrintFlow — Task Tracker

**Updated:** 2026-05-10 | **Owner:** Abdul Ducker

---

## Status Legend
- `[ ]` Not started
- `[~]` In progress
- `[x]` Done — committed

---

## Phase 4 — Page Redesigns (Design System Plan)

### Task 1 — Commit new UI components ✅ ready to commit
- [ ] StatusPill, ConfirmDialog, NotificationBell, CompanyBadge, WorkflowTimeline
- [ ] Header.tsx updated to use NotificationBell
- [ ] components/ui/index.ts exports updated
**Files:** `components/ui/*.tsx`, `components/layout/Header.tsx`, `components/ui/index.ts`

---

### Task 2 — Production page redesign
- [ ] Replace card list → horizontal `WorkflowTimeline` stepper
- [ ] Stage cards: operator, machine, start time, elapsed time
- [ ] Action buttons on active stage only (start / pause / complete / flag)
- [ ] Inline QA approval status per stage using `StatusPill`
**Files:** `app/(app)/production/page.tsx`, `app/(app)/production/[id]/page.tsx`

---

### Task 3 — Pre-Press page redesign
- [ ] Design list → card grid (thumbnail placeholder, StatusPill, age)
- [ ] Design detail: split view (file preview left, approval thread right)
- [ ] Spec form: tabbed sections (Basic → Printing → Finishing → Approvals)
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
