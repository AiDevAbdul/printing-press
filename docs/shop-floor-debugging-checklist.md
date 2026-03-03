# Shop Floor Debugging Checklist

## Step-by-Step Verification

### 1. Check Production Page First
Before checking Shop Floor, verify jobs exist:

1. Go to **Production** page (`/production`)
2. Do you see any jobs in the table?
3. What are their statuses?
4. Take a screenshot if possible

### 2. Check Browser Console (Shop Floor Page)
1. Go to **Shop Floor** page
2. Open browser console (F12)
3. Look for "Shop Floor Debug" log
4. Copy and paste the ENTIRE output here

Expected format:
```javascript
Shop Floor Debug: {
  showAllJobs: false,  // or true
  isLoading: false,
  error: null,  // or error object
  jobs: [],  // should have jobs if they exist
  myJobs: undefined,  // or array
  allJobsResponse: undefined  // or object
}
```

### 3. Check Network Tab
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Go to Shop Floor page
4. Look for these API calls:
   - `/api/production/shop-floor/my-jobs` (when showAllJobs = false)
   - `/api/production/jobs?status=...` (when showAllJobs = true)
5. Click on the request
6. Check:
   - Status code (should be 200)
   - Response data (what does it return?)
   - Request headers (is Authorization token present?)

### 4. Test "Show All Jobs" Toggle
1. On Shop Floor page, click **"Show All Jobs"** button
2. Check console again - what changed?
3. Check Network tab - new API call?
4. Any errors?

### 5. Verify You Have Production Jobs

#### Check Orders Page
1. Go to **Orders** page
2. Do you have any orders?
3. Are any orders **approved**?

#### Check Planning Page
1. Go to **Planning** page
2. Do you see approved orders?
3. Have you created any production jobs?

#### Check Production Page
1. Go to **Production** page
2. Do you see any jobs?
3. What are their statuses?
4. Are any jobs **in_progress** or **queued**?

### 6. Create a Test Job (If None Exist)

Follow this EXACT workflow:

#### Step A: Create Order
1. Go to **Orders** page
2. Click **"Add Order"** button
3. Fill in:
   - Customer: Select any customer
   - Product Name: "Test Product"
   - Quantity: 100
   - Unit: "pcs"
   - Order Date: Today
   - Delivery Date: Tomorrow
   - Priority: High
4. Click Submit
5. **Verify**: Order appears in table with status "pending"

#### Step B: Approve Order
1. Find your order in the Orders table
2. In the **Actions** column, click **"Approve"** button
3. Confirm the action
4. **Verify**: Status changes to "approved"

#### Step C: Create Production Job
1. Go to **Planning** page
2. **Verify**: You see your approved order
3. Click **"Create Job"** button for that order
4. Fill in:
   - Start Date: Today
   - End Date: Tomorrow
   - Assigned Machine: "TEST-MACHINE"
   - **Assigned Operator**: SELECT YOURSELF (important!)
   - Estimated Hours: 8
5. Click **"Create Job"**
6. **Verify**: Success toast appears

#### Step D: Start the Job
1. Go to **Production** page
2. Find your job (should have status "queued")
3. In the **Actions** column, click **"Start"** button
4. **Verify**: Status changes to "in_progress"

#### Step E: Check Shop Floor
1. Go to **Shop Floor** page
2. Refresh page (Ctrl+F5)
3. Check console for "Shop Floor Debug"
4. Should see your job in "My Jobs"
5. Try clicking "Show All Jobs" - should also see it

### 7. Common Issues

#### Issue: No orders exist
**Solution**: Create an order first (Step A above)

#### Issue: Orders exist but not approved
**Solution**: Click "Approve" button in Orders page

#### Issue: Approved orders exist but no production jobs
**Solution**: Go to Planning page and create jobs

#### Issue: Production jobs exist but status is "completed" or "cancelled"
**Solution**: These won't show in Shop Floor. Create a new job or change status to "queued" then "Start" it

#### Issue: Production job exists with status "queued" but not showing
**Solution**: Click "Start" button in Production page to change to "in_progress"

#### Issue: Job assigned to different operator
**Solution**:
- Click "Show All Jobs" to see all jobs
- OR create a new job and assign to yourself

### 8. API Response Check

If jobs still not showing, check the API response:

1. Open Network tab
2. Go to Shop Floor page
3. Click "Show All Jobs"
4. Find the request: `GET /api/production/jobs?status=in_progress,queued,paused`
5. Check response:

**Expected response:**
```json
{
  "data": [
    {
      "id": "...",
      "job_number": "JOB-...",
      "status": "in_progress",
      "order": { ... },
      ...
    }
  ],
  "total": 1
}
```

**If response is empty:**
```json
{
  "data": [],
  "total": 0
}
```
This means no jobs exist with those statuses.

### 9. Report Back

Please provide:
1. Console "Shop Floor Debug" output
2. Network tab response for the API call
3. Screenshot of Production page showing jobs (if any)
4. Did you follow the workflow to create a test job?
5. What happened at each step?

This will help me identify the exact issue!
