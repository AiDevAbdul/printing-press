# CLAUDE.md

Printing Press Management System - NestJS backend + React frontend for packaging/printing companies.

## Critical Non-Standard Patterns

**Tailwind CSS v4 Setup** (breaks if wrong):
- Uses `@tailwindcss/vite` plugin (NOT PostCSS)
- `index.css` uses `@import "tailwindcss";` (NOT `@tailwind` directives)
- No tailwind.config.js needed

**Backend**:
- Global API prefix: `/api` (all routes)
- TypeORM `synchronize: false` - always use migrations
- Roles: `admin`, `sales`, `planner`, `accounts`, `inventory`
- Default admin: `admin@printingpress.com` / `admin123`

## Common Pitfalls

**Field Name Mismatches**:
- Customers: use `postal_code` not `pincode`

**Type Coercion** (HTML forms return strings):
```typescript
quantity: Number(formData.quantity)
order_date: new Date(formData.order_date).toISOString()
```

**Response Structure**:
```typescript
const items = response?.data || [];  // Backend returns { data: [], total: 0 }
```

**Auto-Generated Fields** (never set manually):
- `inline_status` - auto-updates from stage/process/machine
- `queue_position` - auto-recalculates on status changes
- `searchable_text` - auto-updates from job details

## Documentation

- **Domain Knowledge**: `docs/domain-knowledge.md` - Product types, machines, printing terminology
- **Production Workflow**: `docs/production-workflow.md` - Queue management, stage tracking, auto-generation rules
- **API Conventions**: `docs/api-conventions.md` - DTO validation, type coercion, response structures
- **Troubleshooting**: `docs/troubleshooting.md` - Common errors and solutions
