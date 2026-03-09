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

**Toast Notifications**:
- Use `react-hot-toast` for all user notifications
- NEVER use browser `alert()` or `confirm()` - use toast.success() / toast.error()
- Toaster component already configured in main.tsx

## Common Pitfalls

**Field Name Mismatches**:
- Customers: use `postal_code` not `pincode`

**Type Coercion** (HTML forms return strings):
```typescript
quantity: Number(formData.quantity)
order_date: new Date(formData.order_date).toISOString()
```

**ID Types**:
- User IDs: UUID strings (e.g., "abc-123-def") - NEVER convert to numbers
- Production Job IDs: UUID strings
- Order IDs: UUID strings
- Stage IDs, Workflow Stage IDs: integers

**Response Structure**:
```typescript
const items = response?.data || [];  // Backend returns { data: [], total: 0 }
```

**Auto-Generated Fields** (never set manually):
- `inline_status` - auto-updates from stage/process/machine
- `queue_position` - auto-recalculates on status changes
- `searchable_text` - auto-updates from job details

**Routing**:
- Production page route: `/production` (NOT `/production-jobs`)
- Production API endpoint: `/api/production/jobs` (NOT `/api/production-jobs`)

**Production Workflow**:
- Workflow stages automatically use operator and machine from job card
- `operator_id` is a UUID string (NOT a number) - User IDs are UUIDs
- Workflow component receives: `operatorId: string`, `operatorName: string`, `machine: string`
- No manual input required per stage - data comes from job assignment

## Key Features

**Export Functionality**:
- Excel exports available via ExportModule
- Endpoints: `/api/export/wastage-analytics`, `/api/export/quality-metrics`, `/api/export/dashboard-stats`
- Uses `exceljs` library for professional formatting
- All exports include summary sections with calculated metrics

**Analytics**:
- Wastage analytics: `/api/production/wastage-analytics` with date range filtering
- Quality metrics: Built-in FPY calculations and defect tracking
- Dispatch metrics: On-time delivery rate, average delivery time

## Documentation

### Core Documentation
- **Implementation Status**: `docs/implementation-status.md` - 100% completion status, all 5 modules, system statistics
- **Gap Analysis Implementation**: `docs/gap-analysis-implementation.md` - Recent enhancements (exports, analytics, notifications)
- **Deployment Guide**: `docs/deployment-guide.md` - Complete deployment guide with troubleshooting
- **Feature Enhancements**: `docs/feature-enhancements.md` - All module enhancements and improvements
- **Implementation Plan**: `docs/PLAN.md` - Original implementation plan for all modules
- **Client Requirements**: `docs/CLIENT_REQ.md` - Client requirements and specifications

### Technical Documentation
- **Architecture**: `docs/ARCHITECTURE.md` - System architecture and design
- **API Conventions**: `docs/api-conventions.md` - DTO validation, type coercion, response structures
- **Domain Knowledge**: `docs/domain-knowledge.md` - Product types, machines, printing terminology
- **Production Workflow**: `docs/production-workflow.md` - Queue management, stage tracking, auto-generation rules
- **Troubleshooting**: `docs/troubleshooting.md` - Common errors and solutions

### Module-Specific Documentation
- **Quality Module**: `docs/quality-implementation.md` - Quality control implementation details
- **Shop Floor Module**: `docs/shop-floor-implementation.md` - Shop floor management implementation details
