# Phase 6: Cutover & Cleanup Plan

## Overview

Phase 6 is the final migration phase: complete critical page implementations, integrate file uploads, and prepare for production deployment.

**Scope:** Implement Priority 1 pages as full examples, then provide pattern for remaining pages.

## Tasks

### 1. Priority 1 Pages (Critical) — Full Implementation

Implement 5 critical pages with full API integration, pagination, filtering, and forms:

#### 1.1 Orders (`/orders`)
- List view with pagination, status filter, search
- Create new order form (with customer selector)
- Order detail view with edit capability
- Delete/cancel order functionality
- API endpoint: `GET/POST /api/orders`, `GET/PATCH/DELETE /api/orders/[id]`

#### 1.2 Customers (`/customers`)
- List view with pagination, search by name/email
- Create new customer form
- Customer detail view with edit
- Delete customer (soft delete)
- API endpoint: `GET/POST /api/customers`, `GET/PATCH/DELETE /api/customers/[id]`

#### 1.3 Quotations (`/quotations`)
- List with pagination, status filter
- Create quotation from scratch or convert from order
- Quotation detail view with PDF preview
- Status workflow: draft → submitted → approved/rejected/converted
- API endpoint: `GET/POST /api/quotations`, `GET/PATCH /api/quotations/[id]`

#### 1.4 Production (`/production`)
- Production job list with status, timeline
- Job detail view with stage tracking
- Assign operator/machine to stages
- Status transitions: queued → in_progress → completed
- File uploads for designs and proofs
- API endpoint: `GET/POST /api/production`, `GET/PATCH /api/production/[id]`

#### 1.5 Quality (`/quality`)
- Inspection list with status
- Create inspection for a job
- Update inspection results
- Links to production jobs
- API endpoint: `GET/POST /api/quality`, `GET/PATCH /api/quality/[id]`

### 2. Integration Examples

#### 2.1 File Uploads
Show pattern in Production and Prepress pages:
```typescript
import { FileUpload } from '@/components/ui';

<FileUpload
  category="designs"
  allowedTypes={['image/png', 'application/pdf']}
  onUploadComplete={(urls) => {
    // Update API with file URL
    await updateDesign({ design_file_url: urls[0] });
  }}
/>
```

#### 2.2 Data Fetching with React Query
Show pattern in all pages:
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['orders', page, filters],
  queryFn: () => fetch(`/api/orders?page=${page}&...`).then(r => r.json()),
});

const mutation = useMutation({
  mutationFn: (data) => fetch('/api/orders', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }).then(r => r.json()),
  onSuccess: () => queryClient.invalidateQueries(['orders']),
});
```

#### 2.3 Form Handling with React Hook Form
Show pattern in create/edit forms:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(createOrderSchema),
  defaultValues: { customer_id: '', ... },
});

form.handleSubmit(async (data) => {
  await mutation.mutateAsync(data);
});
```

### 3. Remaining Pages (27 stubs)

After implementing Priority 1 pages, provide clear implementation guide for others:

**Priority 2 (implement next):**
- Shop Floor (`/shop-floor`) — Similar to Production, focus on operator workflow
- Dispatch (`/dispatch`) — Similar to Orders, manage deliveries
- Prepress (`/prepress`) — Design approval with file uploads
- Invoices (`/invoices`) — List/detail with PDF export
- Specifications (`/specifications`) — Product specs management

**Priority 3 (implement later):**
- Users, User Management, Costing, Wastage Analytics, QA Approval, Workflow, Profile

**Priority 4 (implement last):**
- 7 role-based dashboards (can be generated from main dashboard with role filtering)

### 4. Legacy Code Cleanup

After Priority 1 pages are stable:

```bash
# Backup old code (optional)
tar czf old-code-backup.tar.gz frontend/ backend/

# Remove old frontend and backend
rm -rf frontend/
rm -rf backend/

# Clean up config files
rm -f nest-cli.json
rm -f tsconfig.backend.json
rm -f vite.config.ts

# Update root .gitignore
# Remove references to frontend/ and backend/
```

### 5. Deployment Prep

#### 5.1 Environment Variables
Verify all required vars in `.env.local`:
```env
DATABASE_URL=postgresql://...
BLOB_READ_WRITE_TOKEN=vercel_blob_...
JWT_SECRET=your-secret-key
```

#### 5.2 Production Build
```bash
npm run build
npm run start
```

#### 5.3 Database Migration
```bash
npx prisma migrate deploy
npx prisma generate
```

#### 5.4 Vercel Deployment
```bash
vercel env pull           # Pull prod env vars
npm run build
vercel deploy             # Deploy to preview
vercel deploy --prod      # Deploy to production
```

### 6. Testing Checklist

- [ ] All 5 Priority 1 pages fully functional
- [ ] CRUD operations work (Create, Read, Update, Delete)
- [ ] Pagination and filtering work
- [ ] File uploads work end-to-end
- [ ] Multi-tenant isolation verified (company_id filtering)
- [ ] Auth middleware validates all requests
- [ ] No console errors or warnings
- [ ] Performance acceptable (< 3s page load)

## Timeline

- **Priority 1 Pages**: 2-3 days (5 pages × 4-6 hours each)
- **Integration Examples**: 1 day (documentation + code samples)
- **Remaining Pages Implementation Guide**: 0.5 day (template + examples)
- **Legacy Cleanup**: 0.5 day (backup + delete)
- **Deployment Prep & Testing**: 1 day

**Total Phase 6: ~5 days** (flexible based on testing needs)

## Implementation Order

1. Orders page (foundation for other features)
2. Customers page (required by Orders)
3. Quotations page (extends Orders)
4. Production page (core feature, uses files)
5. Quality page (depends on Production)
6. Document patterns → remaining pages
7. Clean up legacy code
8. Test and deploy

## Success Criteria

✅ All 5 Priority 1 pages fully implemented and tested
✅ File upload integration working
✅ Multi-tenant isolation verified
✅ Old frontend/ and backend/ directories deleted
✅ Production build completes without errors
✅ Can deploy to Vercel without manual interventions
✅ All 19 APIs tested and working with UI
