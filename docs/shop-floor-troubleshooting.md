# Shop Floor Troubleshooting Guide

## Issue: No Jobs Showing in Shop Floor

### Quick Diagnosis Steps

1. **Open Browser Console** (F12 → Console tab)
   - Look for the debug log: `Shop Floor Debug:`
   - Check for any error messages

2. **Check the debug output**:
   ```javascript
   Shop Floor Debug: {
     showAllJobs: false,  // or true
     isLoading: false,
     error: null,         // or error message
     jobs: [],            // should contain jobs if they exist
     myJobs: [],
     allJobsResponse: { data: [], total: 0 }
   }
   ```

### Common Issues & Solutions

#### Issue 1: No Production Jobs Created Yet
**Symptoms**:
- `jobs: []` in console
- Message: "No active jobs found"

**Solution**: Create production jobs following this workflow:

1. **Create an Order** (Orders page)
   - Click "Add Order"
   - Fill in customer, product, quantity, dates
   - Submit

2. **Approve the Order** (Orders page)
   - Find your order in the table
   - Click "Approve" button in Actions column
   - Status changes from `pending` to `approved`

3. **Create Production Job** (Planning page - NEW)
   - Go to Planning page from dashboard
   - You'll see approved orders
   - Click "Create Job" button
   - Fill in:
     - Start Date
     - End Date
     - Assigned Machine (e.g., "HB1", "UV#1")
     - **Assigned Operator** (select a user - IMPORTANT!)
     - Estimated Hours
   - Click "Create Job"

4. **Start the Job** (Production page)
   - Go to Production page
   - Find your job (status: `queued`)
   - Click "Start" button
   - Status changes to `in_progress`

5. **View in Shop Floor** (Shop Floor page)
   - If job assigned to you: appears in "My Jobs"
   - Click "Show All Jobs" to see all active jobs

#### Issue 2: Jobs Not Assigned to Current User
**Symptoms**:
- "My Jobs" shows empty
- "Show All Jobs" shows jobs

**Solution**:
- Jobs must be assigned to you during creation in Planning page
- OR use "Show All Jobs" toggle to see all jobs
- OR reassign jobs in Production page (if edit feature exists)

#### Issue 3: Jobs Have Wrong Status
**Symptoms**:
- Jobs exist in Production page but not Shop Floor

**Check**:
- Shop Floor only shows jobs with status: `queued`, `in_progress`, or `paused`
- If job is `completed` or `cancelled`, it won't appear

**Solution**:
- In Production page, check job status
- Use "Start" button to change `queued` → `in_progress`
- Use "Resume" button to change `paused` → `in_progress`

#### Issue 4: API Error
**Symptoms**:
- Red error box appears
- Console shows error message

**Common Errors**:

1. **401 Unauthorized**
   - Token expired
   - Solution: Logout and login again

2. **404 Not Found**
   - Backend not running
   - Solution: Start backend server (`npm run start:dev` in backend folder)

3. **Network Error**
   - Backend URL wrong
   - Solution: Check `VITE_API_BASE_URL` in frontend/.env

#### Issue 5: Backend Not Running
**Symptoms**:
- Network error in console
- Cannot connect to API

**Solution**:
```bash
cd backend
npm run start:dev
```

Backend should start on `http://localhost:3000`

### Verification Checklist

- [ ] Backend server is running (`http://localhost:3000/api`)
- [ ] Frontend server is running (`http://localhost:5173`)
- [ ] User is logged in (check localStorage for `access_token`)
- [ ] At least one order exists (Orders page)
- [ ] Order is approved (status = `approved`)
- [ ] Production job created from Planning page
- [ ] Production job has status `queued` or `in_progress`
- [ ] Production job assigned to an operator (for "My Jobs" view)
- [ ] Browser console shows no errors

### Testing the Complete Workflow

**Test 1: Create and View Job**
1. Login as admin
2. Create order → Approve order
3. Go to Planning → Create production job (assign to yourself)
4. Go to Production → Start the job
5. Go to Shop Floor → Should see job in "My Jobs"

**Test 2: View All Jobs**
1. Create multiple jobs assigned to different operators
2. Go to Shop Floor
3. Click "Show All Jobs"
4. Should see all active jobs regardless of operator

**Test 3: Toggle Between Views**
1. Go to Shop Floor
2. Click "Show All Jobs" → should see all jobs
3. Click "Show My Jobs" → should see only your jobs
4. Toggle should work without errors

### Debug Information to Collect

If issue persists, collect this information:

1. **Browser Console Output**:
   - Copy the "Shop Floor Debug" log
   - Copy any error messages

2. **Network Tab** (F12 → Network):
   - Filter by "production"
   - Check API calls:
     - `/api/production/shop-floor/my-jobs`
     - `/api/production/jobs?status=...`
   - Check response status and data

3. **Database Check** (if you have access):
   ```sql
   SELECT id, job_number, status, assigned_operator
   FROM production_jobs
   WHERE status IN ('queued', 'in_progress', 'paused');
   ```

4. **User Info**:
   - Current logged-in user ID
   - User role

### Expected Behavior

**"My Jobs" View**:
- Shows jobs where `assigned_operator.id = current_user.id`
- AND `status IN ('queued', 'in_progress')`
- Auto-refreshes every 10 seconds

**"All Jobs" View**:
- Shows all jobs where `status IN ('queued', 'in_progress', 'paused')`
- Displays operator name for each job
- Auto-refreshes every 10 seconds

### Quick Fix Commands

**Restart Backend**:
```bash
cd backend
npm run start:dev
```

**Restart Frontend**:
```bash
cd frontend
npm run dev
```

**Clear Browser Cache**:
- Press Ctrl+Shift+Delete
- Clear cached images and files
- Reload page (Ctrl+F5)

**Reset Database** (if needed):
```bash
cd backend
npm run migration:revert
npm run migration:run
```

### Contact Information

If issue persists after following this guide:
1. Share browser console output
2. Share network tab screenshots
3. Describe exact steps taken
4. Mention any error messages
