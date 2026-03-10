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

**Auto-Generated Fields** (never set manually):
- `inline_status` - auto-updates from stage/process/machine
- `queue_position` - auto-recalculates on status changes
- `searchable_text` - auto-updates from job details

**Production Workflow**:
- Workflow stages have **non-sequential orders** (1,2,3,4,8,10,11) due to optional stages
- Backend automatically **inherits operator and machine** from previous completed stage if not assigned
- `operator_id` is a UUID string (NOT a number) - User IDs are UUIDs
- Stage progression uses `stage_order` comparison, NOT `stage_order + 1` (handles gaps)
- Frontend sends empty string for operator_id if not available - backend handles inheritance

## Documentation

Start with `docs/README.md` for navigation to all documentation.
