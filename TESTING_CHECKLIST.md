# Testing & Verification Checklist

## Printing Press Management System - Phase 1 MVP

Use this checklist to verify that all components are working correctly.

---

## 🔧 Pre-Testing Setup

### Environment Setup
- [ ] Node.js v18+ installed
- [ ] PostgreSQL 15+ installed (or Docker available)
- [ ] Git repository initialized
- [ ] All dependencies installed (backend & frontend)

### Configuration
- [ ] Backend `.env` file created and configured
- [ ] Frontend `.env` file created and configured
- [ ] Database connection details correct
- [ ] JWT secrets configured

### Database
- [ ] PostgreSQL server running
- [ ] Database `printing_press` created
- [ ] Migrations executed successfully
- [ ] Default admin user created

---

## 🚀 Backend Testing

### Server Startup
- [ ] Backend builds without errors (`npm run build`)
- [ ] Backend starts successfully (`npm run start:dev`)
- [ ] Server running on http://localhost:3000
- [ ] No console errors on startup

### Authentication Endpoints
- [ ] POST `/api/auth/login` - Login works with admin credentials
  - Email: admin@printingpress.com
  - Password: admin123
  - Returns access_token and refresh_token
- [ ] GET `/api/auth/me` - Returns current user info (with token)
- [ ] POST `/api/auth/refresh` - Token refresh works

### User Management Endpoints
- [ ] GET `/api/users` - List users (admin only)
- [ ] POST `/api/users` - Create new user (admin only)
- [ ] GET `/api/users/:id` - Get user by ID
- [ ] PATCH `/api/users/:id` - Update user
- [ ] DELETE `/api/users/:id` - Deactivate user

### Customer Management Endpoints
- [ ] GET `/api/customers` - List customers
- [ ] GET `/api/customers?search=test` - Search works
- [ ] GET `/api/customers?page=1&limit=10` - Pagination works
- [ ] POST `/api/customers` - Create customer
- [ ] GET `/api/customers/:id` - Get customer by ID
- [ ] PATCH `/api/customers/:id` - Update customer
- [ ] DELETE `/api/customers/:id` - Deactivate customer

### Order Management Endpoints
- [ ] GET `/api/orders` - List orders
- [ ] GET `/api/orders?status=pending` - Filter by status works
- [ ] POST `/api/orders` - Create order
  - Auto-generates order_number
  - Links to customer
- [ ] GET `/api/orders/:id` - Get order by ID
- [ ] PATCH `/api/orders/:id` - Update order
- [ ] PATCH `/api/orders/:id/status` - Update order status
- [ ] DELETE `/api/orders/:id` - Cancel order

### Production Management Endpoints
- [ ] GET `/api/production/jobs` - List production jobs
- [ ] POST `/api/production/jobs` - Create production job
  - Auto-generates job_number
  - Links to order
- [ ] GET `/api/production/jobs/:id` - Get job by ID
- [ ] PATCH `/api/production/jobs/:id` - Update job
- [ ] POST `/api/production/jobs/:id/start` - Start job
  - Records actual_start_date
  - Updates status to in_progress
- [ ] POST `/api/production/jobs/:id/complete` - Complete job
  - Records actual_end_date
  - Calculates actual_hours
  - Updates status to completed
- [ ] GET `/api/production/schedule?startDate=2026-02-01&endDate=2026-02-28` - Get schedule

### Inventory Management Endpoints
- [ ] GET `/api/inventory/items` - List inventory items
- [ ] GET `/api/inventory/items?category=paper` - Filter by category
- [ ] GET `/api/inventory/items/low-stock` - Get low stock items
- [ ] POST `/api/inventory/items` - Create inventory item
- [ ] GET `/api/inventory/items/:id` - Get item by ID
- [ ] PATCH `/api/inventory/items/:id` - Update item
- [ ] DELETE `/api/inventory/items/:id` - Deactivate item
- [ ] POST `/api/inventory/transactions` - Create transaction
  - Updates item stock level
  - Records transaction history
- [ ] GET `/api/inventory/transactions` - List transactions
- [ ] GET `/api/inventory/items/:id/transactions` - Get item transactions

### Job Costing Endpoints
- [ ] POST `/api/costing/jobs/:jobId/costs` - Add cost to job
- [ ] GET `/api/costing/jobs/:jobId` - Get job costs
- [ ] GET `/api/costing/jobs/:jobId/summary` - Get cost summary
  - Calculates totals by cost type
- [ ] PATCH `/api/costing/costs/:id` - Update cost
- [ ] DELETE `/api/costing/costs/:id` - Delete cost

### Invoice Endpoints
- [ ] GET `/api/invoices` - List invoices
- [ ] GET `/api/invoices?status=draft` - Filter by status
- [ ] POST `/api/invoices` - Create invoice
  - Auto-generates invoice_number
  - Calculates tax_amount
  - Creates invoice items
- [ ] GET `/api/invoices/:id` - Get invoice by ID
- [ ] GET `/api/invoices/:id/items` - Get invoice items
- [ ] PATCH `/api/invoices/:id` - Update invoice
- [ ] POST `/api/invoices/:id/payment` - Record payment
  - Updates paid_amount
  - Updates balance_amount
  - Updates status to paid when fully paid
- [ ] DELETE `/api/invoices/:id` - Cancel invoice

### Dashboard Endpoints
- [ ] GET `/api/dashboard/stats` - Get statistics
  - Returns order counts by status
  - Returns production job counts
  - Returns low stock items count
  - Returns pending invoices amount
- [ ] GET `/api/dashboard/recent-orders` - Get recent orders
- [ ] GET `/api/dashboard/production-status` - Get production status
- [ ] GET `/api/dashboard/pending-deliveries` - Get pending deliveries

---

## 🎨 Frontend Testing

### Application Startup
- [ ] Frontend builds without errors (`npm run build`)
- [ ] Frontend starts successfully (`npm run dev`)
- [ ] Application running on http://localhost:5173
- [ ] No console errors on startup

### Login Page
- [ ] Login page loads correctly
- [ ] Form validation works
- [ ] Login with correct credentials succeeds
- [ ] Login with incorrect credentials shows error
- [ ] Redirects to dashboard after successful login
- [ ] Token stored in localStorage

### Dashboard Page
- [ ] Dashboard loads after login
- [ ] Statistics cards display correctly
  - Total orders
  - Production jobs
  - Low stock items
  - Pending invoices
- [ ] Recent orders table displays
- [ ] Data loads from API
- [ ] No console errors

### Navigation
- [ ] Sidebar displays correctly
- [ ] All menu items visible
- [ ] Navigation to different pages works
- [ ] User info displays in sidebar
- [ ] Logout button works
- [ ] Logout clears tokens and redirects to login

### Protected Routes
- [ ] Accessing protected routes without login redirects to login
- [ ] After login, can access all protected routes
- [ ] Token refresh works automatically
- [ ] Expired token redirects to login

### API Integration
- [ ] API calls include JWT token in headers
- [ ] API errors display correctly
- [ ] Loading states work
- [ ] Data caching works (React Query)

---

## 🔐 Security Testing

### Authentication
- [ ] Cannot access API without token
- [ ] Invalid token returns 401 error
- [ ] Expired token triggers refresh
- [ ] Refresh token works correctly
- [ ] Logout clears all tokens

### Authorization
- [ ] Admin can access all endpoints
- [ ] Sales can access customer/order endpoints
- [ ] Sales cannot access admin-only endpoints
- [ ] Planner can access production endpoints
- [ ] Accounts can access costing/invoice endpoints
- [ ] Inventory can access inventory endpoints
- [ ] Role restrictions enforced on backend

### Input Validation
- [ ] Invalid email format rejected
- [ ] Short passwords rejected (< 6 chars)
- [ ] Required fields validated
- [ ] Invalid data types rejected
- [ ] SQL injection attempts blocked

### Password Security
- [ ] Passwords hashed in database
- [ ] Cannot retrieve plain text password
- [ ] Password comparison works correctly

---

## 📊 Database Testing

### Data Integrity
- [ ] Foreign key constraints work
- [ ] Cannot delete referenced records
- [ ] Cascade deletes work where configured
- [ ] Unique constraints enforced
- [ ] Default values applied correctly

### Indexes
- [ ] Queries on indexed fields are fast
- [ ] Search queries perform well
- [ ] Pagination works efficiently

### Migrations
- [ ] All migrations run successfully
- [ ] Migration rollback works
- [ ] Database schema matches entities
- [ ] Default admin user created

---

## 🔄 Workflow Testing

### Complete Order Flow
1. [ ] Create customer
2. [ ] Create order for customer
3. [ ] Order number auto-generated
4. [ ] Order status: pending
5. [ ] Approve order (status: approved)
6. [ ] Create production job from order
7. [ ] Job number auto-generated
8. [ ] Assign machine and operator
9. [ ] Start job (status: in_progress)
10. [ ] Add material costs to job
11. [ ] Add labor costs to job
12. [ ] Complete job (status: completed)
13. [ ] Order status updates to completed
14. [ ] Create invoice from order
15. [ ] Invoice number auto-generated
16. [ ] Invoice includes job costs
17. [ ] Record payment
18. [ ] Invoice status updates to paid

### Inventory Flow
1. [ ] Create inventory item
2. [ ] Record stock in transaction
3. [ ] Stock level increases
4. [ ] Create production job
5. [ ] Add material cost (links to inventory)
6. [ ] Record stock out transaction
7. [ ] Stock level decreases
8. [ ] Stock falls below reorder level
9. [ ] Item appears in low stock alerts
10. [ ] Dashboard shows low stock count

---

## 🐛 Error Handling Testing

### Backend Errors
- [ ] 400 Bad Request for invalid data
- [ ] 401 Unauthorized for missing token
- [ ] 403 Forbidden for insufficient permissions
- [ ] 404 Not Found for non-existent resources
- [ ] 409 Conflict for duplicate entries
- [ ] 500 Internal Server Error handled gracefully

### Frontend Errors
- [ ] API errors display user-friendly messages
- [ ] Network errors handled
- [ ] Loading states prevent multiple submissions
- [ ] Form validation errors display correctly

---

## 📈 Performance Testing

### Backend Performance
- [ ] API responses < 500ms for most endpoints
- [ ] Pagination works for large datasets
- [ ] Database queries optimized
- [ ] No N+1 query problems

### Frontend Performance
- [ ] Initial page load < 3 seconds
- [ ] Navigation between pages is smooth
- [ ] No memory leaks
- [ ] React Query caching reduces API calls

---

## 📱 Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest)

### Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Sidebar responsive

---

## 📝 Documentation Testing

### Documentation Completeness
- [ ] README.md exists and is accurate
- [ ] SETUP.md has clear instructions
- [ ] IMPLEMENTATION.md details all features
- [ ] SUMMARY.md provides overview
- [ ] ARCHITECTURE.md explains system design
- [ ] API endpoints documented
- [ ] Environment variables documented

### Setup Scripts
- [ ] setup.sh works on Linux/Mac
- [ ] setup.bat works on Windows
- [ ] Scripts create .env files
- [ ] Scripts install dependencies
- [ ] Scripts run migrations

---

## ✅ Final Verification

### Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Code follows consistent style
- [ ] No console.log statements in production code
- [ ] No commented-out code blocks

### Git Repository
- [ ] .gitignore configured correctly
- [ ] node_modules not committed
- [ ] .env files not committed
- [ ] All source files committed

### Production Readiness
- [ ] Environment variables externalized
- [ ] Secrets not hardcoded
- [ ] Error logging configured
- [ ] Database connection pooling configured
- [ ] CORS configured correctly

---

## 🎯 Success Criteria

All items above should be checked (✅) before considering Phase 1 MVP complete.

### Critical Items (Must Pass):
- Authentication works
- All CRUD operations work
- Database migrations successful
- Role-based access control enforced
- Complete order-to-invoice workflow works
- Dashboard displays correct data

### Important Items (Should Pass):
- All API endpoints respond correctly
- Frontend pages load without errors
- Error handling works
- Input validation works
- Security measures in place

### Nice to Have (Can be improved later):
- Performance optimization
- Advanced error messages
- Comprehensive logging
- Monitoring setup

---

## 📊 Test Results Template

```
Date: _______________
Tester: _______________

Backend Tests: ___/100 passed
Frontend Tests: ___/50 passed
Security Tests: ___/20 passed
Database Tests: ___/15 passed
Workflow Tests: ___/20 passed
Error Handling: ___/10 passed
Performance: ___/10 passed

Total: ___/225 passed (___%)

Critical Issues Found: ___
Major Issues Found: ___
Minor Issues Found: ___

Status: [ ] PASS  [ ] FAIL  [ ] NEEDS WORK

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🔧 Troubleshooting Common Issues

### Issue: Migrations fail
**Solution:**
1. Ensure database exists
2. Check database credentials in .env
3. Run `npm run build` first
4. Check migration files for syntax errors

### Issue: Cannot login
**Solution:**
1. Verify migrations ran successfully
2. Check admin user exists in database
3. Verify password hash is correct
4. Check JWT_SECRET in .env

### Issue: CORS errors
**Solution:**
1. Check VITE_API_BASE_URL in frontend .env
2. Verify backend CORS configuration
3. Ensure backend is running

### Issue: Token expired
**Solution:**
1. Token refresh should happen automatically
2. Check refresh token endpoint works
3. Clear localStorage and login again

---

**Testing Checklist Version:** 1.0
**Last Updated:** February 23, 2026
**Status:** Ready for Testing
