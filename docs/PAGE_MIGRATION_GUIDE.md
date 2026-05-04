# Phase 3 Step 4: Page Migration Guide

## Status: Stub Pages Created (24/28) + Dashboard Fully Implemented (1/28)

All 28 pages now have either stub implementations or full implementations. Stub pages show placeholder content and link to the old implementation for reference.

## Page Mapping (Old → New)

### Dashboard (1 page - COMPLETE)
| Old Path | New Path | Status | Notes |
|----------|----------|--------|-------|
| `/dashboard` | `/dashboard` | ✅ DONE | Full implementation with stats, metrics, production overview |

### Dashboard Pages (7 pages - STUBS)
| Old Path | New Path | Status | Source |
|----------|----------|--------|--------|
| `/dashboards/prepress` | `/dashboards/prepress` | 🔄 Stub | frontend.old/src/pages/dashboards/PrePressDashboard.tsx |
| `/dashboards/production` | `/dashboards/production` | 🔄 Stub | frontend.old/src/pages/dashboards/ProductionDashboard.tsx |
| `/dashboards/quality` | `/dashboards/quality` | 🔄 Stub | frontend.old/src/pages/dashboards/QualityDashboard.tsx |
| `/dashboards/sales` | `/dashboards/sales` | 🔄 Stub | frontend.old/src/pages/dashboards/SalesDashboard.tsx |
| `/dashboards/finance` | `/dashboards/finance` | 🔄 Stub | frontend.old/src/pages/dashboards/FinanceDashboard.tsx |
| `/dashboards/inventory` | `/dashboards/inventory` | 🔄 Stub | frontend.old/src/pages/dashboards/InventoryDashboard.tsx |
| `/dashboards/analytics` | `/dashboards/analytics` | 🔄 Stub | frontend.old/src/pages/dashboards/AnalyticsDashboard.tsx |

### Feature Pages (10 pages - STUBS)
| Old Path | New Path | Status | Source |
|----------|----------|--------|--------|
| `/orders` | `/orders` | 🔄 Stub | frontend.old/src/pages/orders/Orders.tsx |
| `/customers` | `/customers` | 🔄 Stub | frontend.old/src/pages/customers/Customers.tsx |
| `/quotations` | `/quotations` | 🔄 Stub | frontend.old/src/pages/quotations/Quotations.tsx |
| `/planning` | `/planning` | 🔄 Stub | frontend.old/src/pages/planning/Planning.tsx |
| `/production` | `/production` | 🔄 Stub | frontend.old/src/pages/production/Production.tsx |
| `/shop-floor` | `/shop-floor` | 🔄 Stub | frontend.old/src/pages/shop-floor/ShopFloor.tsx |
| `/quality` | `/quality` | 🔄 Stub | frontend.old/src/pages/quality/Quality.tsx |
| `/dispatch` | `/dispatch` | 🔄 Stub | frontend.old/src/pages/dispatch/Dispatch.tsx |
| `/prepress` | `/prepress` | 🔄 Stub | frontend.old/src/pages/prepress/Prepress.tsx |
| `/specifications` | `/specifications` | 🔄 Stub | frontend.old/src/pages/prepress/Specifications.tsx |

### Management Pages (10 pages - STUBS)
| Old Path | New Path | Status | Source |
|----------|----------|--------|--------|
| `/users` | `/users` | 🔄 Stub | frontend.old/src/pages/users/Users.tsx |
| `/user-management` | `/user-management` | 🔄 Stub | frontend.old/src/pages/users/UserManagement.tsx |
| `/invoices` | `/invoices` | 🔄 Stub | frontend.old/src/pages/invoices/Invoices.tsx |
| `/costing` | `/costing` | 🔄 Stub | frontend.old/src/pages/costing/Costing.tsx |
| `/wastage-analytics` | `/wastage-analytics` | 🔄 Stub | frontend.old/src/pages/wastage/WastageAnalytics.tsx |
| `/qa-approval` | `/qa-approval` | 🔄 Stub | frontend.old/src/pages/qa/QAApproval.tsx |
| `/workflow` | `/workflow` | 🔄 Stub | frontend.old/src/pages/workflow/WorkflowPage.tsx |
| `/profile` | `/profile` | 🔄 Stub | frontend.old/src/pages/profile/UserProfile.tsx |

## Next Steps: Implementing Full Page Functionality

### Priority 1: Critical Pages (implement first in Phase 4)
1. **Orders** - Core business functionality
2. **Customers** - Critical for sales workflow
3. **Quotations** - Revenue generation
4. **Production** - Core production tracking
5. **Quality** - QA workflow

### Priority 2: Important Pages (implement after Priority 1)
6. **Shop Floor** - Operator interface
7. **Dispatch** - Logistics
8. **Pre-Press** - Design approval
9. **Invoices** - Billing

### Priority 3: Supporting Pages (implement last)
10. Users, User Management, Costing, Wastage Analytics, QA Approval, Workflow, Profile

### Priority 4: Dashboard Variants
7 role-based dashboards (Pre-Press, Production, Quality, Sales, Finance, Inventory, Analytics)

## Implementation Pattern

### 1. Copy the old page structure
```bash
# Find the old page
cat frontend.old/src/pages/[module]/[Page].tsx

# Copy its imports and structure
# Update React Router → Next.js:
#   - useNavigate() → useRouter()
#   - navigate('/path') → router.push('/path')
#   - <Link to="/path"> → <Link href="/path">
```

### 2. Update imports
```typescript
// Old
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

// New
import { useRouter } from 'next/navigation'
import { orderService } from '@/lib/services/orders.service'
```

### 3. Replace API calls
```typescript
// Old
const { data } = await api.get('/orders')

// New
const response = await fetch('/api/orders', { credentials: 'include' })
const data = await response.json()
```

### 4. Add 'use client' directive
```typescript
'use client';

import { ... }
```

### 5. Replace components
All components are available from `@/components/ui/` with the same API as before.

## Service Pattern

Services bridge old backend API and new fetch-based approach. Create in `lib/services/`:

```typescript
// lib/services/orders.service.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const response = await fetch(`${API_BASE}/orders`, { credentials: 'include' })
    if (!response.ok) throw new Error('Failed to fetch orders')
    return response.json()
  },
  // ... more methods
}
```

## During Phase 4

As Route Handlers are implemented in Phase 4, replace fetch calls to old backend with Next.js Route Handlers:

```typescript
// Before (Phase 3)
const response = await fetch('http://localhost:3000/api/orders', { credentials: 'include' })

// After (Phase 4)
const response = await fetch('/api/orders', { credentials: 'include' })
```

The change is transparent to the page code — only the service layer updates.

## UI Components Available

All these components are ready to use from `@/components/ui/`:
- Button, Input, Card, Modal, Badge, Tabs
- Select, Checkbox, Radio, Alert
- Skeleton, EmptyState, Pagination
- SortButton

They use Apple HIG design tokens (brand colors, shadows, spacing defined in `app/globals.css`).

## Current Backend

While implementing pages, the old NestJS backend at `http://localhost:3000` is available:
- Run `npm run start:dev` in `backend/` (port 3000)
- All existing endpoints work with credentials: 'include'

When Phase 4 implements Route Handlers, they will replace this backend transparently.
