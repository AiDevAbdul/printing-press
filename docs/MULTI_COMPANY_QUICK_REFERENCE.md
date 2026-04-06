# Multi-Company System - Quick Reference Guide

## 🚀 Quick Start

### Run Migrations
```bash
cd backend
npm run typeorm migration:run
```

### Test Login
- Email: `admin@printingpress.com`
- Password: `admin123`
- Expected: Company selector page with 4 companies

### Companies
1. Capital Packages
2. CPP Pre Press
3. BEST FOIL
4. SILVO Enterprises

---

## 📋 Implementation Checklist

### Pre-Deployment
- [ ] Backup database
- [ ] Review MULTI_COMPANY_IMPLEMENTATION_COMPLETE.md
- [ ] Run migrations on staging
- [ ] Test login flow on staging

### Deployment
- [ ] Run migrations on production
- [ ] Restart backend service
- [ ] Clear frontend cache
- [ ] Test login on production
- [ ] Test company selector
- [ ] Test company switcher
- [ ] Verify data isolation

### Post-Deployment
- [ ] Monitor error logs
- [ ] Test all CRUD operations
- [ ] Verify data isolation between companies
- [ ] Document any issues

---

## 🔑 Key Endpoints

### Authentication
- `POST /api/auth/login` - Login (returns companies list)
- `POST /api/auth/select-company` - Select company (returns JWT with company_id)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Companies
- `GET /api/companies` - List all companies
- `GET /api/companies/:id` - Get company details

### Data Endpoints (All filtered by company_id)
- `GET /api/customers` - List customers
- `GET /api/orders` - List orders
- `GET /api/quotations` - List quotations
- `GET /api/inventory` - List inventory
- `GET /api/production` - List production jobs
- `GET /api/quality` - List quality checkpoints
- `GET /api/dispatch` - List deliveries
- `GET /api/dashboard` - Get dashboard stats

---

## 🔐 Security Features

✅ **JWT with company_id** - Every request includes company_id in JWT
✅ **Database-level filtering** - All queries filter by company_id
✅ **Composite unique constraint** - Same email allowed across companies
✅ **Header validation** - X-Company-ID header sent with all requests
✅ **Data isolation** - Complete separation between companies

---

## 📊 Database Schema Changes

### New Table
- `companies` - Stores company information

### Modified Tables
- `users` - Added company_id (foreign key)
- `customers` - Added company_id
- `orders` - Added company_id
- `quotations` - Added company_id
- `invoices` - Added company_id
- `production_jobs` - Added company_id
- `inventory_items` - Added company_id
- `quality_checkpoints` - Added company_id
- Plus 18 dependent tables

### Indexes Added
- `(company_id, status)` - For filtering by status
- `(company_id, created_at)` - For sorting by date
- `(company_id)` - For general lookups

---

## 🎯 Frontend Flow

```
Login Page
    ↓
Enter credentials
    ↓
Backend validates & returns companies list
    ↓
Company Selector Page
    ↓
User clicks company
    ↓
Frontend calls /auth/select-company
    ↓
Backend returns JWT with company_id
    ↓
Dashboard (company-filtered data)
    ↓
Header shows company name + switcher
    ↓
User can switch companies anytime
```

---

## 🔄 Backend Flow

```
Request arrives with X-Company-ID header
    ↓
JwtAuthGuard validates JWT
    ↓
JWT payload includes company_id
    ↓
Controller extracts user.company_id
    ↓
Service receives companyId parameter
    ↓
All queries filter by: WHERE company_id = :companyId
    ↓
Only company's data returned
```

---

## 🧪 Testing Commands

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@printingpress.com","password":"admin123"}'
```

### Test Company Selection
```bash
curl -X POST http://localhost:3000/api/auth/select-company \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"company_id":"<company_id>"}'
```

### Test Data Endpoint
```bash
curl -X GET http://localhost:3000/api/customers \
  -H "Authorization: Bearer <access_token>" \
  -H "X-Company-ID: <company_id>"
```

---

## 📝 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Login returns empty companies | Migrations not run | Run migrations |
| Company selector not showing | Frontend cache | Clear browser cache |
| Data from other companies visible | Filtering not applied | Check service methods |
| Company switcher not working | Cache not invalidated | Check CompanySwitcher component |
| 401 Unauthorized | Invalid JWT | Re-login and get new token |
| 403 Forbidden | User not in company | Verify user belongs to company |

---

## 📚 Documentation Files

- `MULTI_COMPANY_IMPLEMENTATION_COMPLETE.md` - Full implementation details
- `MULTI_COMPANY_STATUS.md` - Status report and testing checklist
- `CLAUDE.md` - Project instructions and patterns

---

## 🎓 Architecture Decisions

### Why separate company selector page?
- Clear user intent
- Prevents accidental data access
- Better UX than modal

### Why company switcher in header?
- Easy access without logout
- Seamless company switching
- Familiar SaaS pattern

### Why JWT includes company_id?
- Stateless authentication
- No database lookup needed
- Secure and efficient

### Why database-level filtering?
- Defense in depth
- Prevents accidental data leakage
- Enforces isolation at source

---

## 🚨 Critical Reminders

⚠️ **Always run migrations before deploying**
⚠️ **Verify data isolation after deployment**
⚠️ **Clear browser cache after frontend updates**
⚠️ **Test with multiple companies**
⚠️ **Monitor logs for filtering errors**

---

## 📞 Support

For issues or questions:
1. Check MULTI_COMPANY_IMPLEMENTATION_COMPLETE.md
2. Review error logs
3. Verify migrations ran successfully
4. Test with curl commands
5. Check browser console for frontend errors

---

**Implementation Date**: 2026-04-06
**Status**: ✅ COMPLETE
**Ready for**: Testing & Deployment
