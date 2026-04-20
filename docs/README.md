# Printing Press Management System - Documentation

**Last Updated:** April 20, 2026 | **Status:** ✅ Production Ready

## 📚 Essential Documentation

### Getting Started
- **[QUICK_START.md](QUICK_START.md)** - Setup, credentials, first steps
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design, data flow, modules

### Development
- **[MULTI_TENANT.md](MULTI_TENANT.md)** - Multi-company architecture, data isolation, JWT
- **[API_CONVENTIONS.md](API_CONVENTIONS.md)** - API patterns, DTOs, validation
- **[WORKFLOW.md](WORKFLOW.md)** - Production workflow, stage progression, operator inheritance
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions

### Reference
- **[CLIENT_REQ.md](CLIENT_REQ.md)** - Original requirements
- **[DOMAIN_KNOWLEDGE.md](DOMAIN_KNOWLEDGE.md)** - Printing industry terminology

---

## 🎯 By Role

**Developers**: QUICK_START.md → ARCHITECTURE.md → MULTI_TENANT.md → API_CONVENTIONS.md

**DevOps/Deployment**: QUICK_START.md → ARCHITECTURE.md

**Product/Business**: CLIENT_REQ.md → DOMAIN_KNOWLEDGE.md

---

## 📊 System Overview

**Multi-Tenant**: 4 companies (Capital Packages, CPP Pre Press, BEST FOIL, SILVO Enterprises)

**Tech Stack**: NestJS + React 18 + TypeORM + PostgreSQL + Tailwind v4

**Modules**: Auth, Users, Customers, Orders, Production, Inventory, Costing, Dashboard (12/12 complete)

**Key Stats**: 40+ tables, 150+ endpoints, 30+ pages, 36+ components, ~75k LOC

---

## 🚀 Quick Commands

```bash
# Backend
cd backend && npm install && npm run typeorm migration:run && npm run start:dev

# Frontend
cd frontend && npm install && npm run dev

# Login
Email: admin@printingpress.com | Password: admin123
```

---

**Built with NestJS, React, PostgreSQL, and Claude Opus 4.6**
