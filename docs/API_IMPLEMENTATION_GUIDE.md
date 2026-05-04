# Phase 4: API Route Handlers Implementation Guide

## Overview

This guide explains how to implement API Route Handlers for all 19 backend modules, replacing the NestJS backend with Next.js serverless functions.

## Pattern: Standard CRUD Handler

All Route Handlers follow this pattern:

```typescript
// app/api/[module]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const createSchema = z.object({
  // Fields from Prisma schema
});

const updateSchema = createSchema.partial();

// GET - List all items
export async function GET(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext(req);
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      db.[model].findMany({
        where: { company_id: companyId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      db.[model].count({ where: { company_id: companyId } }),
    ]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST - Create item
export async function POST(req: NextRequest) {
  try {
    const { companyId, userId } = await getTenantContext(req);
    const body = await req.json();
    const validated = createSchema.parse(body);

    const item = await db.[model].create({
      data: { ...validated, company_id: companyId },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

## Pattern: Detail Handler

```typescript
// app/api/[module]/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateSchema = z.object({
  // Fields from Prisma schema (all optional for PATCH)
}).partial();

// GET - Detail
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = params;

    const item = await db.[model].findFirst({
      where: { id, company_id: companyId },
    });

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// PATCH - Update
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = params;
    const body = await req.json();

    // Verify ownership
    const existing = await db.[model].findFirst({
      where: { id, company_id: companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const validated = updateSchema.parse(body);
    const item = await db.[model].update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// DELETE - Soft or hard delete
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { companyId } = await getTenantContext(req);
    const { id } = params;

    const existing = await db.[model].findFirst({
      where: { id, company_id: companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Option 1: Soft delete (for most models)
    await db.[model].update({
      where: { id },
      data: { is_active: false },
    });

    // Option 2: Hard delete (if no soft delete field)
    // await db.[model].delete({ where: { id } });

    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

## Modules to Implement (19 total)

### ✅ DONE (2 modules)
1. **Companies** — `app/api/companies/route.ts`
2. **Customers** — `app/api/customers/route.ts` + `[id]/route.ts`

### 🔄 Priority 1 (implement next)
3. **Users** — `app/api/users/route.ts` + `[id]/route.ts`
   - Prisma model: `users`
   - Old location: `backend.old/src/users/`
   - Note: Password hashing, role-based access

4. **Notifications** — `app/api/notifications/route.ts` + `[id]/route.ts`
   - Prisma model: `notifications`
   - Old location: `backend.old/src/notifications/`
   - Simple CRUD

### 🔄 Priority 2
5. **Orders** — `app/api/orders/route.ts` + `[id]/route.ts`
   - Prisma model: `orders`
   - Complex: Multiple views, workflows, status tracking

6. **Quotations** — `app/api/quotations/route.ts` + `[id]/route.ts`
   - Prisma model: `quotations`
   - Old location: `backend.old/src/quotations/`

7. **Dashboard** — `app/api/dashboard/route.ts`
   - Special endpoints: `/stats`, `/production-status`, `/revenue-trend`
   - Aggregation queries, not standard CRUD

### 🔄 Priority 3
8. **Inventory** — `app/api/inventory/route.ts` + `[id]/route.ts`
   - Prisma model: `inventory_items`
   - Stock tracking, low stock alerts

9. **Costing** — `app/api/costing/route.ts` + `[id]/route.ts`
   - Prisma model: `costing_config` (for config)
   - Old location: `backend.old/src/costing/`

10. **Invoices** — `app/api/invoices/route.ts` + `[id]/route.ts`
    - Prisma model: `invoices`
    - Complex: Invoice generation, tracking

### 🔄 Priority 4 (complex business logic)
11. **Production** — `app/api/production/route.ts` + `[id]/route.ts`
    - Prisma model: `production_jobs`
    - Complex: Stage transitions, operator assignment

12. **Prepress** — `app/api/prepress/route.ts` + `[id]/route.ts`
    - Prisma model: `designs`
    - Design approvals, attachments

13. **Quality** — `app/api/quality/route.ts` + `[id]/route.ts`
    - Prisma model: `inspections` (or `quality_checks`)
    - Complex: Multiple inspection types

14. **Dispatch** — `app/api/dispatch/route.ts` + `[id]/route.ts`
    - Prisma model: `deliveries`
    - Tracking, delivery updates

15. **Workflow** — `app/api/workflow/route.ts`
    - Custom endpoints for stage transitions
    - Complex logic: Stage sequencing, operator assignment

### 📦 Remaining (4 modules)
16. **Export** — `app/api/export/route.ts`
    - Special handler for Excel generation
    - Not standard CRUD

17. **Approvals** — `app/api/approvals/route.ts` + `[id]/route.ts`
    - Prisma model: `design_approvals`
    - Approval workflows

18. **Activity Log** — `app/api/activity-log/route.ts`
    - Read-only: Audit trail
    - Simple: GET only

19. **Notifications** (if separate from other modules)
    - Prisma model: `notifications`
    - Create, read, mark as read

## Implementation Checklist

For each module, follow this checklist:

- [ ] Create `app/api/[module]/route.ts` (list + create)
- [ ] Create `app/api/[module]/[id]/route.ts` (detail + update + delete)
- [ ] Add validation schemas with Zod
- [ ] Add multi-tenant filtering (where: { company_id: companyId })
- [ ] Add error handling
- [ ] Test with old backend running on `http://localhost:3000`
- [ ] Update service in `lib/services/[module].service.ts` to use new endpoints
- [ ] Update page components to use new service layer

## Multi-Tenant Safety

**CRITICAL:** Every database query MUST filter by company_id:

```typescript
// ✅ CORRECT
const items = await db.[model].findMany({
  where: { company_id: companyId }  // ← Required
});

// ❌ WRONG - data leak!
const items = await db.[model].findMany();
```

## Service Layer Integration

Create or update `lib/services/[module].service.ts`:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export const [module]Service = {
  async get[Items](): Promise<any[]> {
    const response = await fetch(`${API_BASE}/[module]`, { credentials: 'include' })
    if (!response.ok) throw new Error('Failed to fetch')
    const data = await response.json()
    return data.data
  },
  // ... more methods
}
```

## Testing

Test each endpoint with curl before moving to the next module:

```bash
# List
curl http://localhost:3001/api/customers -H "Cookie: auth_token=..." 

# Create
curl -X POST http://localhost:3001/api/customers \
  -H "Cookie: auth_token=..." \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com"}'

# Detail
curl http://localhost:3001/api/customers/[id] \
  -H "Cookie: auth_token=..."

# Update
curl -X PATCH http://localhost:3001/api/customers/[id] \
  -H "Cookie: auth_token=..." \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated"}'

# Delete
curl -X DELETE http://localhost:3001/api/customers/[id] \
  -H "Cookie: auth_token=..."
```

## References

- **Prisma models**: `prisma/schema.prisma`
- **Old NestJS implementation**: `backend.old/src/[module]/`
- **Database utilities**: `lib/db.ts`, `lib/tenant.ts`, `lib/auth.ts`
