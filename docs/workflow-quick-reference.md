# Complete Workflow - Order to Shop Floor

## Quick Reference Guide

### 1. Orders Module (Sales)
**Route**: `/orders`

**Actions**:
- ✅ Create new orders
- ✅ Approve pending orders → `approved`
- ✅ Cancel orders → `cancelled`

**Status Flow**:
```
pending → approved (Approve button)
pending → cancelled (Cancel button)
approved → cancelled (Cancel button)
```

---

### 2. Planning Module (Planner)
**Route**: `/planning` ⭐ NEW

**Purpose**: Convert approved orders into production jobs

**What You See**:
- Only orders with status = `approved`
- Filters: Priority, Search

**Actions**:
- Click "Create Job" for any approved order
- Fill in production details:
  - Scheduled start/end dates
  - Assigned machine (e.g., "HB1", "UV#1")
  - Assigned operator (select from users)
  - Estimated hours
  - Notes

**Result**: Creates production job with status = `queued`

---

### 3. Production Module (Planner/Manager)
**Route**: `/production`

**What You See**:
- All production jobs
- Filters: Status

**Actions by Status**:

| Status | Available Actions |
|--------|------------------|
| `queued` | Start, Cancel |
| `in_progress` | Pause, Complete, Cancel |
| `paused` | Resume, Cancel |
| `completed` | No actions |
| `cancelled` | No actions |

**Status Flow**:
```
queued → in_progress (Start button)
in_progress → paused (Pause button)
in_progress → completed (Complete button)
paused → in_progress (Resume button)
any active → cancelled (Cancel button)
```

---

### 4. Shop Floor Module (Operators)
**Route**: `/shop-floor`

**Purpose**: Operators track their assigned jobs

**Two Views**:

#### My Jobs (Default)
- Shows jobs assigned to logged-in operator
- Status: `queued` or `in_progress`
- Auto-refreshes every 10 seconds

#### All Jobs (Toggle)
- Shows all active jobs
- Status: `queued`, `in_progress`, or `paused`
- Displays operator name for each job
- Auto-refreshes every 10 seconds

**Toggle Button**: "Show All Jobs" / "Show My Jobs"

**Job Details**:
- Job number
- Product name
- Customer
- Order number
- Current stage
- Machine
- Operator (in All Jobs view)
- Inline status

---

### 5. Complete Example Workflow

#### Scenario: New Order for 1000 Business Cards

**Step 1: Sales Creates Order**
1. Go to **Orders** page
2. Click "Add Order"
3. Fill in:
   - Customer: ABC Company
   - Product: Business Cards
   - Quantity: 1000
   - Delivery Date: 2026-03-10
   - Priority: High
4. Submit → Order created with status `pending`

**Step 2: Sales Approves Order**
1. In **Orders** page, find the order
2. Click "Approve" button
3. Status changes to `approved`

**Step 3: Planner Creates Production Job**
1. Go to **Planning** page
2. See the approved order in the list
3. Click "Create Job"
4. Fill in:
   - Start Date: 2026-03-04
   - End Date: 2026-03-06
   - Machine: "HB1"
   - Operator: John Doe
   - Estimated Hours: 8
5. Submit → Production job created with status `queued`

**Step 4: Planner Starts Production**
1. Go to **Production** page
2. Find the job (status: `queued`)
3. Click "Start" button
4. Status changes to `in_progress`

**Step 5: Operator Works on Job**
1. Operator (John Doe) logs in
2. Goes to **Shop Floor** page
3. Sees the job in "My Jobs" view
4. Clicks on job to see details
5. Starts working on stages (Pre-press, Printing, etc.)

**Step 6: Supervisor Monitors**
1. Supervisor goes to **Shop Floor** page
2. Clicks "Show All Jobs"
3. Sees all active jobs across all operators
4. Monitors progress

---

## Key Points

### For Sales Team
- Create orders and approve them
- Approved orders automatically appear in Planning

### For Planning Team
- View approved orders in Planning page
- Create production jobs with machine/operator assignments
- Start/pause/complete jobs in Production page

### For Operators
- View assigned jobs in Shop Floor
- Use "Show All Jobs" to see shop floor activity
- Jobs auto-refresh every 10 seconds

### For Supervisors
- Use "Show All Jobs" in Shop Floor for overview
- Monitor all active jobs across operators
- Check Production page for detailed management

---

## Status Reference

### Order Statuses
- `pending` - Awaiting approval
- `approved` - Ready for production planning
- `in_production` - Has active production job
- `completed` - Production finished
- `delivered` - Dispatched to customer
- `cancelled` - Order cancelled

### Production Job Statuses
- `queued` - Waiting to start
- `in_progress` - Currently being worked on
- `paused` - Temporarily stopped
- `completed` - Finished
- `cancelled` - Job cancelled

---

## Troubleshooting

### "No jobs in Shop Floor"
1. Check if production jobs exist (Production page)
2. Check job status (must be queued/in_progress/paused)
3. Check if job assigned to you (or use "Show All Jobs")
4. Check browser console for errors

### "Can't create production job"
1. Verify order is approved (Orders page)
2. Check if order appears in Planning page
3. Ensure all required fields filled
4. Check browser console for errors

### "Can't start production job"
1. Verify job status is `queued`
2. Check user permissions (need planner/admin role)
3. Check backend is running

---

## API Endpoints Reference

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status

### Production Jobs
- `GET /api/production/jobs` - List production jobs
- `POST /api/production/jobs` - Create production job
- `POST /api/production/jobs/:id/start` - Start job
- `POST /api/production/jobs/:id/complete` - Complete job
- `PATCH /api/production/jobs/:id/status` - Update job status

### Shop Floor
- `GET /api/production/shop-floor/my-jobs` - Get my assigned jobs
- `GET /api/production/jobs?status=in_progress,queued,paused` - Get all active jobs

---

## Last Updated
2026-03-03
