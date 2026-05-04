# PrintFlow — Documentation

**Last Updated:** 2026-05-04 | **Status:** Active Development (CPP onboarding)

## Essential Docs

### Getting Started
- **[QUICK_START.md](QUICK_START.md)** — Setup, credentials, first steps
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — System design, data flow, modules

### Development
- **[MULTI_TENANT.md](MULTI_TENANT.md)** — Multi-company architecture, data isolation, JWT
- **[API_CONVENTIONS.md](API_CONVENTIONS.md)** — API patterns, DTOs, validation
- **[WORKFLOW.md](WORKFLOW.md)** — Production workflow, stage progression
- **[DESIGN_SYSTEM_PLAN.md](DESIGN_SYSTEM_PLAN.md)** — Apple HIG design system, token reference, phase roadmap
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** — Common issues

### Reference
- **[DOMAIN_KNOWLEDGE.md](DOMAIN_KNOWLEDGE.md)** — Printing industry terminology

---

## Companies

| Company | Focus | Status |
|---------|-------|--------|
| Capital Print and Pack (CPP) | Pre-Press, Production | **Primary — onboarding now** |
| SILVO Enterprises | Alu-alu foil / pharma blister | Phase 5 |
| Best Foil | Luxury foil packaging | Phase 5 |

---

## Tech Stack

**Backend**: NestJS · TypeORM · PostgreSQL  
**Frontend**: React 19 · Vite · Tailwind v4 · React Query  
**Design**: Apple HIG — Inter font, CSS custom property tokens, spring-physics motion  
**Auth**: JWT with `company_id` + `is_super_admin` in payload

---

## Quick Commands

```bash
# Backend
cd backend && npm install && npm run typeorm migration:run && npm run start:dev

# Frontend
cd frontend && npm install && npm run dev

# Login: admin@printingpress.com / admin123
```

---

**For UI work: always check [DESIGN_SYSTEM_PLAN.md](DESIGN_SYSTEM_PLAN.md) before hardcoding any color, spacing, or shadow values.**
