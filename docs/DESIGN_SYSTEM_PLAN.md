# Design System Plan — PrintFlow
**Version:** 1.1 | **Date:** 2026-05-04 | **Status:** In Progress — Phases 0–3 Complete

---

## Overview

This document defines the complete design system, rebranding direction, and implementation
roadmap for the printing press management platform. The system serves three companies
(CPP, SILVO, Best Foil) under a single product shell, with CPP (Capital Print and Pack)
as the primary focus for the initial rollout.

**Design Philosophy**: Apple Human Interface Guidelines applied to a professional web SaaS —
clean whitespace, purposeful depth, fluid motion, and system-native feel. Every element
should feel considered, not cluttered.

---

## 1. Brand Architecture

Three companies share one product shell. Each gets a distinct color identity that is visually
consistent with the system design language but immediately recognisable as "their" brand.

### 1A. Capital Print and Pack (CPP) — Primary Focus
**Industry**: Carton printing, Pre-Press and Production workflows
**Brand personality**: Precise, professional, creative craft, quality-first
**Metaphor**: The deep blue of a printing plate + the warmth of fresh ink on press

| Token | Value | Rationale |
|-------|-------|-----------|
| Brand Primary | `#1B4FDB` | Rich cobalt — trust, precision, print industry authority |
| Brand Primary Dark | `#1239B5` | Hover / pressed states |
| Brand Primary Light | `#EEF3FD` | Tinted surfaces, selected states |
| Brand Accent | `#F97316` | Warm orange — energy of the press, ink warmth, action CTAs |
| Brand Accent Dark | `#EA6A06` | Accent hover |
| Page Background | `#F5F5F7` | Apple's exact gray background |
| Surface | `#FFFFFF` | Cards, panels |
| Text Primary | `#1D1D1F` | Apple's exact dark text |
| Text Secondary | `#6E6E73` | Apple's secondary label color |
| Text Tertiary | `#AEAEB2` | Apple's tertiary label |
| Border | `#D2D2D7` | Apple's separator color |
| Border Subtle | `#E8E8ED` | Inner borders, dividers |

**Semantic function colors** (shared across all companies):

| Role | Light Mode | Dark Mode |
|------|-----------|-----------|
| Success | `#34C759` | `#30D158` |
| Warning | `#FF9500` | `#FF9F0A` |
| Error / Danger | `#FF3B30` | `#FF453A` |
| Info | `#007AFF` | `#0A84FF` |
| Queued | `#636366` | `#8E8E93` |
| In Progress | `#007AFF` | `#0A84FF` |
| Completed | `#34C759` | `#30D158` |
| Paused | `#FF9500` | `#FF9F0A` |

---

### 1B. SILVO Enterprises
**Industry**: Alu-alu foil, pharmaceutical blister packaging
**Brand personality**: Precision, clinical, pharmaceutical-grade quality, silver
**Metaphor**: Cool teal of sterile environments + silver of metallic packaging

| Token | Value |
|-------|-------|
| Brand Primary | `#0D7490` |
| Brand Primary Dark | `#0A5F73` |
| Brand Primary Light | `#E0F7FA` |
| Brand Accent | `#6366F1` |

---

### 1C. Best Foil
**Industry**: Foil packaging, luxury finishing
**Brand personality**: Premium, luxurious, golden, bold
**Metaphor**: Gold of foil stamping + depth of premium packaging

| Token | Value |
|-------|-------|
| Brand Primary | `#92400E` |
| Brand Primary Dark | `#78350F` |
| Brand Primary Light | `#FEF3C7` |
| Brand Accent | `#EAB308` |

---

## 2. Design Tokens

All tokens live in CSS custom properties, consumed by Tailwind v4's `@theme` block.
This makes theming per-company a single class swap on `<html>` or `<body>`.

### Token Structure

```css
/* frontend/src/index.css */

@theme {
  /* === CPP Theme (default) === */
  --color-brand:           #1B4FDB;
  --color-brand-dark:      #1239B5;
  --color-brand-light:     #EEF3FD;
  --color-accent:          #F97316;
  --color-accent-dark:     #EA6A06;

  /* === Page Structure === */
  --color-page-bg:         #F5F5F7;
  --color-surface:         #FFFFFF;
  --color-surface-raised:  #FFFFFF;      /* cards with elevation */
  --color-surface-overlay: rgba(255,255,255,0.82); /* glass panels */

  /* === Text === */
  --color-text-primary:    #1D1D1F;
  --color-text-secondary:  #6E6E73;
  --color-text-tertiary:   #AEAEB2;
  --color-text-inverse:    #FFFFFF;

  /* === Borders === */
  --color-border:          #D2D2D7;
  --color-border-subtle:   #E8E8ED;

  /* === Semantic === */
  --color-success:         #34C759;
  --color-success-bg:      #F0FDF4;
  --color-warning:         #FF9500;
  --color-warning-bg:      #FFFBEB;
  --color-danger:          #FF3B30;
  --color-danger-bg:       #FFF1F0;
  --color-info:            #007AFF;
  --color-info-bg:         #EFF6FF;

  /* === Status (production-specific) === */
  --color-status-queued:   #636366;
  --color-status-running:  #007AFF;
  --color-status-paused:   #FF9500;
  --color-status-done:     #34C759;
  --color-status-blocked:  #FF3B30;

  /* === Elevation (shadow scale) === */
  --shadow-1: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-2: 0 4px 8px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-3: 0 8px 16px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04);
  --shadow-4: 0 16px 32px rgba(0,0,0,0.10), 0 8px 16px rgba(0,0,0,0.06);
  --shadow-modal: 0 24px 48px rgba(0,0,0,0.14), 0 12px 24px rgba(0,0,0,0.08);

  /* === Glass === */
  --blur-sm:   8px;
  --blur-md:   16px;
  --blur-lg:   24px;

  /* === Radius === */
  --radius-xs:  4px;
  --radius-sm:  8px;
  --radius-md:  10px;   /* inputs, buttons */
  --radius-lg:  14px;   /* cards */
  --radius-xl:  20px;   /* panels, sheets */
  --radius-2xl: 28px;   /* large modals */
  --radius-full: 9999px;

  /* === Motion === */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out:    cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-in-out: cubic-bezier(0.46, 0.03, 0.52, 0.96);
  --duration-fast:   120ms;
  --duration-normal: 220ms;
  --duration-slow:   340ms;
}

/* SILVO theme override */
[data-company="silvo"] {
  --color-brand:       #0D7490;
  --color-brand-dark:  #0A5F73;
  --color-brand-light: #E0F7FA;
  --color-accent:      #6366F1;
  --color-accent-dark: #4F46E5;
}

/* Best Foil theme override */
[data-company="bestfoil"] {
  --color-brand:       #92400E;
  --color-brand-dark:  #78350F;
  --color-brand-light: #FEF3C7;
  --color-accent:      #EAB308;
  --color-accent-dark: #CA8A04;
}
```

---

## 3. Typography System

**Target feel**: SF Pro — clean, neutral, readable, system-native.
**Implementation**: `Inter` (web substitute for SF Pro, variable font for weight range).
**Fallback**: `-apple-system, BlinkMacSystemFont` (renders SF Pro on Apple devices automatically).

### Scale

| Name | Size | Weight | Line Height | Use |
|------|------|--------|-------------|-----|
| `display` | 34px | 700 | 1.15 | Page hero titles |
| `title-1` | 28px | 700 | 1.20 | Section titles |
| `title-2` | 22px | 600 | 1.25 | Card headings |
| `title-3` | 20px | 600 | 1.30 | Subheadings |
| `headline` | 17px | 600 | 1.35 | Table headers, labels |
| `body` | 17px | 400 | 1.50 | Default body text |
| `callout` | 16px | 400 | 1.50 | Secondary body |
| `subhead` | 15px | 400 | 1.45 | Supporting text |
| `footnote` | 13px | 400 | 1.45 | Captions, helper text |
| `caption` | 12px | 400 | 1.40 | Badges, timestamps |
| `caption-2` | 11px | 400 | 1.35 | Min-size labels |

### Implementation

```css
/* index.css — add to @theme block */
--font-sans: 'Inter Variable', -apple-system, BlinkMacSystemFont, 'SF Pro Display',
             'Segoe UI', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
```

---

## 4. Spacing & Grid System

**Base unit**: 4px.
All spacing uses multiples of 4. Component internal padding uses 8px increments.
Page-level gutters use 24px+ increments.

### Spacing Scale

| Token | px | Tailwind | Use |
|-------|----|----------|-----|
| space-1 | 4 | `p-1` | Icon padding, tight gaps |
| space-2 | 8 | `p-2` | Input padding, inline gaps |
| space-3 | 12 | `p-3` | Small component padding |
| space-4 | 16 | `p-4` | Card padding (compact) |
| space-5 | 20 | `p-5` | Standard element gap |
| space-6 | 24 | `p-6` | Card padding (default) |
| space-8 | 32 | `p-8` | Section gap |
| space-10 | 40 | `p-10` | Large section padding |
| space-12 | 48 | `p-12` | Page section gap |
| space-16 | 64 | `p-16` | Hero spacing |

### Layout Grid

```
Sidebar: 240px (collapsed: 64px)
Header:  56px (fixed)
Content: fluid, max-width 1440px
Gutter:  24px (mobile: 16px)
Column gap: 16px
```

---

## 5. Elevation & Depth System

Apple-style depth: subtle, purposeful. No dramatic shadows.

| Level | CSS | Used On |
|-------|-----|---------|
| `elevation-0` | no shadow | Flat items, table rows |
| `elevation-1` | `--shadow-1` | Default cards |
| `elevation-2` | `--shadow-2` | Hovered cards, sticky headers |
| `elevation-3` | `--shadow-3` | Dropdowns, popovers |
| `elevation-4` | `--shadow-4` | Sidesheets, panels |
| `elevation-modal` | `--shadow-modal` | Modals, dialogs |

**Glass panels** (for header, sidebar, modals):
```css
background: var(--color-surface-overlay);  /* rgba white 82% */
backdrop-filter: blur(var(--blur-md));
-webkit-backdrop-filter: blur(var(--blur-md));
border: 1px solid rgba(255,255,255,0.6);
```

---

## 6. Motion & Animation System

Apple-style: spring physics for entrances, ease-out for exits, fast for micro-interactions.

### Principles

1. **Purposeful** — every animation explains a state change or spatial relationship
2. **Interruptible** — animations cancel instantly on user action
3. **Spring-forward** — entrances use spring easing (`--ease-spring`); exits use ease-in
4. **Fast exits** — exit duration is ~60% of enter duration
5. **Reduced motion** — all animations wrapped in `@media (prefers-reduced-motion: no-preference)`

### Motion Tokens

```css
/* Micro-interactions (buttons, toggles, badges) */
--motion-micro: var(--duration-fast) var(--ease-out);

/* UI transitions (modals, panels, tabs) */
--motion-ui: var(--duration-normal) var(--ease-spring);

/* Page transitions */
--motion-page: var(--duration-slow) var(--ease-out);

/* Exit animations (60% of enter) */
--motion-exit: 130ms var(--ease-in);
```

### Animation Catalogue

| Name | Keyframes | Duration | Use |
|------|-----------|----------|-----|
| `fade-in` | opacity 0→1 + translateY 6px→0 | 220ms | Content appear |
| `fade-out` | opacity 1→0 + translateY 0→-4px | 140ms | Content dismiss |
| `scale-in` | scale 0.96→1 + opacity 0→1 | 220ms spring | Modal enter |
| `scale-out` | scale 1→0.96 + opacity 1→0 | 130ms | Modal exit |
| `slide-up` | translateY 20px→0 + opacity | 260ms spring | Sheet enter from bottom |
| `slide-down` | translateY 0→20px + opacity | 160ms | Sheet exit |
| `slide-in-left` | translateX -100%→0 | 300ms spring | Sidebar enter |
| `press` | scale 1→0.97 | 80ms | Button press |
| `shimmer` | gradient sweep | 1.6s loop | Skeleton loading |

---

## 7. Component Library

### 7A. Layout Components

#### AppShell
- **Fixed sidebar** (240px, collapsible to icon-only 64px)
- **Sticky header** (56px, frosted glass, `backdrop-filter: blur(16px)`)
- **Main content** with 24px padding, max-width 1440px
- **Company theme** applied via `data-company` attribute on root

#### Sidebar
- Company logo + name at top (swaps on company switch)
- Nav groups with section labels
- Active item: brand-tinted background (`brand-light`), bold label
- Collapsed state: icons only, tooltip on hover
- Bottom: User avatar + name + settings icon

#### Header
- Page title (left)
- Search bar (center, cmd+K trigger)
- Notification bell with badge
- Company switcher (super-admin only)
- User menu (right)

### 7B. Core UI Components (Redesign Map)

| Component | Current State | Target State |
|-----------|--------------|--------------|
| `Button` | Generic Tailwind classes | Variant system + spring press animation + proper disabled state |
| `Card` | Box-shadow only | Elevation levels + hover lift (elevation-1 → elevation-2) |
| `Input` | Basic border | Floating label option, focus ring using brand color, error state |
| `Select` | Native | Custom dropdown with search, keyboard nav, grouped options |
| `Modal` | Basic overlay | scale-in animation, frosted glass backdrop, focus trap |
| `Badge` | Simple span | Status-semantic variants with icon support |
| `Tabs` | Basic underline | Pill tabs (Apple-style) with animated indicator |
| `Table` | Basic | Sticky header, row hover, sortable columns, virtualization for 50+ rows |
| `Skeleton` | shimmer exists | Per-component skeletons (card, table row, stat card) |
| `EmptyState` | Exists | Icon + heading + body + CTA button pattern |
| `Toast` | Sonner | Styled to match design system |
| `Sidebar` | Exists | Collapsible, brand-aware, active state polish |

### 7C. New Components Required

| Component | Description | Priority |
|-----------|-------------|----------|
| `StatCard` | KPI card with trend indicator, spark line option | P1 |
| `BentoGrid` | CSS Grid container with predefined span variants | P1 |
| `WorkflowTimeline` | Horizontal stage stepper with status per stage | P1 |
| `StatusPill` | Animated status indicator (pulse dot for in-progress) | P1 |
| `NotificationBell` | Header bell with dropdown notification list | P1 |
| `CommandPalette` | cmd+K global search / action launcher | P2 |
| `ConfirmDialog` | Replaces `window.confirm()` everywhere | P1 |
| `FileUpload` | Drag-and-drop + progress | P2 |
| `CompanyBadge` | Company logo + name chip for switcher | P1 |
| `ActivityFeed` | Timestamped event list for job history | P2 |
| `ProgressRing` | Circular progress for job completion % | P2 |
| `InlineEdit` | Click-to-edit text fields | P3 |

---

## 8. Dashboard Layout — Bento Grid Pattern

Each role dashboard follows a Bento Grid layout (Apple-style modular cards).

### Dashboard Grid Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│  Header (56px, frosted glass)                                │
│  [Title]           [Search]        [Bell] [Avatar]          │
├──────────┬──────────────────────────────────────────────────┤
│ Sidebar  │                                                   │
│ (240px)  │  KPI Row  [Stat] [Stat] [Stat] [Stat]            │
│          │                                                   │
│ Nav      │  Bento Grid ─────────────────────────────────    │
│ Items    │  ┌─────────────────┐  ┌──────────┐  ┌──────────┐│
│          │  │  Primary Widget │  │  Widget  │  │  Widget  ││
│          │  │  (2×2 span)     │  │  (1×1)   │  │  (1×1)   ││
│          │  └─────────────────┘  └──────────┘  └──────────┘│
│          │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐│
│          │  │ Widget   │  │ Widget   │  │ Wide Widget      ││
│          │  │ (1×1)    │  │ (1×1)   │  │ (2×1 span)      ││
│          │  └──────────┘  └──────────┘  └─────────────────┘│
│          │                                                   │
└──────────┴───────────────────────────────────────────────── ┘
```

### Dashboard Content Per Role

**CPP Production Dashboard** (Planner / Operator)
- KPI row: Active Jobs | Queued | Completed Today | Machine Utilisation %
- Large widget: Live Job Queue (sortable, filterable list with inline actions)
- Medium widgets: Stage Breakdown (bar), Machine Status grid, Urgent jobs
- Small widgets: Today's completions, Wastage %, On-time %

**CPP Pre-Press Dashboard** (Pre-Press role)
- KPI row: Designs In Progress | Awaiting Approval | Approved Today | Revisions
- Large widget: Design Work Queue (with status, customer, due date)
- Medium widgets: Approval Pipeline (kanban-style 3 columns), Recent Specs
- Small widgets: Overdue designs, Pending customer feedback

**QA Dashboard** (QA Manager)
- KPI row: Pending Inspections | Passed Today | Failed Today | Open Complaints
- Large widget: Approvals Queue (approve/reject inline)
- Medium widgets: Defect rate trend (line chart), Stage-wise pass rate (bar)
- Small widgets: Overdue inspections, Customer complaints status

---

## 9. Page-Level Redesign Plan

### 9A. Global Changes (All Pages)
- Replace `window.confirm()` → `ConfirmDialog` component
- Standardise page header: `[Breadcrumb] / [Page Title] [Action Buttons]`
- Apply consistent empty states with illustration + CTA
- Add skeleton loading to every data fetch
- Remove `console.log` debug statements
- Apply `data-company="cpp"` to root element for CPP rollout

### 9B. Production Workflow Page
- Replace current linear card list → horizontal `WorkflowTimeline` stepper
- Stage cards: show operator, machine, start time, elapsed time
- Action buttons on active stage only (start / pause / complete / flag issue)
- Inline QA approval status indicator per stage

### 9C. Pre-Press Page
- Design list → card grid (not table) with thumbnail placeholder, status pill, age
- Design detail: split view (file preview left, approval thread right)
- Spec form: tabbed sections (Basic → Printing → Finishing → Approvals)

### 9D. Order Form
- Current: 90+ fields dumped in one form
- Target: Multi-step form (5 steps with progress bar)
  1. Basic Info (customer, dates, quantity)
  2. Product Specs (CPP cartons / product type selection)
  3. Printing (colors, plates, separation)
  4. Finishing (lamination, varnish, embossing)
  5. Review & Submit
- Auto-save draft on step change

### 9E. Auth / Login Page
- Currently generic
- CPP branded: company logo, cobalt blue brand panel, clean card
- Company selector: card grid (not dropdown) showing company logo + name

---

## 10. Icon System

**Library**: Lucide React (already installed) — consistent 2px stroke, 24px grid
**Style rule**: Stroke icons only (no mixed filled/stroke at same hierarchy)
**Sizing tokens**:
- `icon-xs`: 14px — inline with text
- `icon-sm`: 16px — small buttons, badges
- `icon-md`: 20px — default nav / action icons
- `icon-lg`: 24px — header actions, empty state icons
- `icon-xl`: 32px — large empty states, marketing icons

**Domain icon map** (consistent across all workflows):

| Domain | Icon |
|--------|------|
| Pre-Press / Design | `Layers` |
| Plate Making | `Grid3x3` |
| Machine Setup | `Settings2` |
| Printing / Production | `Printer` |
| Finishing | `Sparkles` |
| Quality Check | `ShieldCheck` |
| Dispatch | `Truck` |
| Quotation | `FileText` |
| Order | `ClipboardList` |
| Invoice | `Receipt` |
| Inventory | `Package` |
| Customer | `Building2` |
| Notification | `Bell` |
| Analytics | `BarChart3` |

---

## 11. Company Switcher UX

Super-admin sees a company switcher in the header. Design:
- Current company shown as a `CompanyBadge` (logo dot + name + chevron)
- Click opens a popover with 3 company cards
- Each card: company color swatch + name + brief role count
- Selecting a company re-applies the `data-company` theme attribute and navigates to that company's dashboard
- Visually, the sidebar accent color, logo, and header tint all update instantly

---

## 12. Implementation Phases

### ✅ Phase 0 — Design Token Foundation
**Status: Complete**

- `frontend/src/index.css` — full `@theme` block (brand, semantic, shadow, radius, motion tokens)
- `frontend/src/context/CompanyContext.tsx` — auto-sets `data-company` on `<html>` on company switch
- Company override classes: `[data-company="silvo"]`, `[data-company="bestfoil"]`

---

### ✅ Phase 1 — Typography & Global Styles
**Status: Complete**

- `frontend/index.html` — Inter font (Google Fonts), title, `data-company="cpp"` default
- `frontend/src/index.css` — Inter font stack, `bg-page-bg`, Apple scrollbar, token-based focus ring
- `frontend/src/App.css` — cleared all Vite demo styles

---

### ✅ Phase 2 — Core Component Redesign
**Status: Complete**

- `Button.tsx` — brand tokens, spring `active:scale-[0.97]`, added `accent` variant
- `Card.tsx` — token shadows, Apple radius, hover lift
- `Input.tsx` — brand focus ring, accessible required marker
- `Modal.tsx` — frosted glass backdrop, spring animation, `useId()`
- `Badge.tsx` — CSS-var status/priority colors with dot indicator
- `Tabs.tsx` — brand active indicator
- `Sidebar.tsx` — brand-light active state, 60px collapsed mode
- `Header.tsx` — glass sticky bar, brand avatar, 56px height
- `Layout.tsx` — `bg-page-bg` shell
- NEW `StatCard.tsx` — metric card with trend arrows
- NEW `BentoGrid.tsx` + `BentoCell.tsx` — responsive bento layout

---

### ✅ Phase 3 — Dashboard Redesign
**Status: Complete**

- `ProductionDashboard.tsx` — live queue from `/dashboard/stats` + `/production/queue`, progress bars
- `PrePressDashboard.tsx` — design table from `/prepress/designs`, status-sorted
- `QualityDashboard.tsx` — approval rate metric, pending queue from `/approvals/pending`

---

### ✅ Phase 4 — Page Redesigns (Complete)
**Files changed:**
- ✅ `Production.tsx` + workflow components — horizontal WorkflowTimeline
- ✅ `Prepress.tsx` — card grid, split detail view, tabbed spec form
- ✅ `Orders.tsx` + create form — StatusPill table, 2-col split detail, wider multi-step form
- ✅ Auth pages — CPP branded split login, design-system company selector
- ✅ No `window.confirm()` calls found — ConfirmDialog already wired where needed

**Deliverable**: CPP Pre-Press, Production, Orders, and Auth pages all polished end-to-end.

---

### ✅ Phase 5 — SILVO & Best Foil Themes (Complete)
**Files changed:**
- ✅ `globals.css` — SILVO teal + Best Foil amber token overrides (already present)
- ✅ `lib/company-context.tsx` — fetches active company from /api/auth/me on mount; correct slug mapping (silvo/bestfoil/cpp); exposes companySlug in context
- ✅ `CompanySwitcher.tsx` — company-specific Lucide icons + per-brand color dots in dropdown; trigger pill styled with current brand color
- ✅ `Sidebar.tsx` — logo row shows per-company abbreviated mark (CPP/SLV/BF) + company name + "PrintFlow" subline; brand color auto-updates via CSS tokens

**Deliverable**: All 3 companies have distinct, polished brand themes end-to-end.

---

## 13. Files Reference Map

| File | Change Type |
|------|-------------|
| `frontend/src/index.css` | Major — full token system |
| `frontend/src/App.css` | Minor — remove demo styles |
| `frontend/index.html` | Minor — font preload |
| `frontend/src/theme/tokens.ts` | Update — CSS var refs |
| `frontend/src/theme/colors.ts` | Update — new brand colors |
| `frontend/src/App.tsx` | Minor — data-company attribute |
| `frontend/src/components/ui/Button.tsx` | Redesign |
| `frontend/src/components/ui/Card.tsx` | Redesign |
| `frontend/src/components/ui/Input.tsx` | Redesign |
| `frontend/src/components/ui/Modal.tsx` | Redesign |
| `frontend/src/components/ui/Badge.tsx` | Redesign |
| `frontend/src/components/ui/Tabs.tsx` | Redesign |
| `frontend/src/components/layout/Sidebar.tsx` | Redesign |
| `frontend/src/components/layout/Header.tsx` | Redesign |
| `frontend/src/components/layout/Layout.tsx` | Update |
| `frontend/src/components/dashboard/StatCard.tsx` | Redesign |
| `frontend/src/pages/dashboards/ProductionDashboard.tsx` | Rebuild |
| `frontend/src/pages/dashboards/PrePressDashboard.tsx` | Rebuild |
| `frontend/src/pages/dashboards/QualityDashboard.tsx` | Rebuild |
| `frontend/src/pages/auth/Login.tsx` | Redesign |
| `frontend/src/pages/production/Production.tsx` | Redesign |
| `frontend/src/pages/prepress/Prepress.tsx` | Redesign |
| `frontend/src/pages/orders/OrderFormModal.tsx` | Multi-step redesign |
| New: `BentoGrid.tsx` | Create |
| New: `WorkflowTimeline.tsx` | Create |
| New: `StatusPill.tsx` | Create |
| New: `NotificationBell.tsx` | Create |
| New: `ConfirmDialog.tsx` | Create |
| New: `CompanyBadge.tsx` | Create |

---

## 14. Quality Standards

Every component delivered must pass this checklist:

- [ ] Contrast ratio ≥ 4.5:1 for all text (verified with browser devtools)
- [ ] All interactive elements have visible focus ring (2px, brand color)
- [ ] Touch targets ≥ 44×44px (per Apple HIG)
- [ ] `prefers-reduced-motion` disables all non-essential animations
- [ ] No `window.confirm()`, no `console.log` in production code
- [ ] Empty state for every list/table
- [ ] Skeleton loading for every async data fetch (not just spinner)
- [ ] Proper ARIA labels on icon-only buttons
- [ ] Consistent use of Lucide icon set (no emoji as icons)
- [ ] Spacing uses 4px grid (no arbitrary pixel values)
- [ ] All color values reference CSS variables (no hardcoded hex in components)

---

## 15. Non-Goals (Out of Scope for This Phase)

- Dark mode — foundation tokens are dark-mode-ready but implementation is deferred
- Mobile PWA — layout is responsive but native mobile experience is a future phase
- Animation library (Framer Motion) — using CSS transitions only to keep bundle lean
- Storybook component documentation — deferred until component library is stable
