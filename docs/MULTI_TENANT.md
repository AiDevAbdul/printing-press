# Multi-Tenant Architecture

## Overview
Single-instance multi-tenant system serving 4 printing companies with complete data isolation at the database level.

## Companies
1. Capital Packages
2. CPP Pre Press
3. BEST FOIL
4. SILVO Enterprises

## Key Concepts

### Super-Admin vs Regular Users
- **Super-Admin** (`is_super_admin = true`): Can access any company via header switcher
- **Regular Users** (`is_super_admin = false`): Locked to single company, cannot switch

### Data Isolation
- All tables have `company_id` column
- All queries filter by `company_id` from JWT payload
- Composite unique constraint on `email + company_id` (users can have same email in different companies)

### JWT Payload
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "company_id": "company-uuid",
  "is_super_admin": false,
  "role": "sales",
  "iat": 1234567890,
  "exp": 1234571490
}
```

## Authentication Flow

### Login
```
POST /api/auth/login { email, password }
→ Returns: access_token, refresh_token, user (with is_super_admin), companies[]
→ Frontend checks is_super_admin:
  - If true: redirect to /company-selector
  - If false: redirect to role-based dashboard
```

### Company Selection (Super-Admin Only)
```
POST /api/auth/select-company { company_id }
→ Super-admin can select ANY company
→ Returns: new access_token with company_id in JWT
→ Frontend stores token and company_id in localStorage
→ Redirects to /dashboard
```

### Company Switching (Super-Admin Only)
```
Click company switcher in header
→ POST /api/auth/select-company { company_id }
→ Page reloads with new company context
→ All data filtered by new company_id
```

## Backend Implementation

### Service Methods
All service methods must accept `companyId` parameter:
```typescript
async getCustomers(companyId: string): Promise<Customer[]> {
  return this.customerRepository.find({
    where: { company_id: companyId }
  });
}
```

### Controllers
Extract `company_id` from JWT and pass to services:
```typescript
@Get()
@UseGuards(JwtAuthGuard)
async getCustomers(@CurrentUser() user: User) {
  return this.customersService.getCustomers(user.company_id);
}
```

### Queries
Always filter by `company_id`:
```typescript
const customers = await this.customerRepository
  .createQueryBuilder('c')
  .where('c.company_id = :companyId', { companyId })
  .getMany();
```

## Frontend Implementation

### API Interceptor
Automatically adds `X-Company-ID` header to all requests:
```typescript
// axios interceptor
config.headers['X-Company-ID'] = localStorage.getItem('company_id');
```

### Company Context
Global state for current company:
```typescript
const { company, setCompany } = useCompany();
```

### useAuth Hook
Includes `isSuperAdmin` flag:
```typescript
const { user, isSuperAdmin } = useAuth();
```

### Company Switcher
Only visible to super-admin users in header.

## Database Migrations

Run in order:
1. `1712425200000-CreateCompaniesTable.ts` - Creates companies table with 4 companies
2. `1712425300000-AddCompanyIdToUsers.ts` - Adds company_id to users
3. `1712425400000-AddCompanyIdToEntities.ts` - Adds company_id to core entities
4. `1712425500000-AddCompanyIdToDependentEntities.ts` - Adds company_id to dependent tables

```bash
npm run typeorm migration:run
```

## Critical Rules

⚠️ **CRITICAL**: All service methods must accept `companyId` parameter
⚠️ **CRITICAL**: All queries must filter by `company_id` to prevent data leakage
⚠️ **CRITICAL**: Controllers must extract `user.company_id` from `@CurrentUser()` and pass to services
⚠️ **CRITICAL**: Frontend must send `X-Company-ID` header with all requests

## Common Pitfalls

- ❌ Forgetting `company_id` filter → data leakage between companies
- ❌ Querying without `company_id` → returns data from all companies
- ❌ Missing `X-Company-ID` header → 401 errors
- ❌ Regular user trying to switch companies → 403 forbidden
- ❌ Not updating service methods → old code doesn't filter by company

## Testing Multi-Tenant

1. Login as super-admin
2. Select Company A
3. Create a customer
4. Switch to Company B
5. Verify customer is NOT visible
6. Switch back to Company A
7. Verify customer IS visible
