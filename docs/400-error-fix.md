# Fix Applied - 400 Bad Request Error

## Issue
The Shop Floor "Show All Jobs" feature was returning a 400 Bad Request error because the backend DTO validation was rejecting comma-separated status values.

## Root Cause
```typescript
// OLD - Only accepts single enum value
@IsEnum(ProductionJobStatus)
status?: ProductionJobStatus;
```

When frontend sent: `status=in_progress,queued,paused`
Backend validation rejected it because it expected a single enum value, not a comma-separated string.

## Fix Applied
**File**: `backend/src/production/dto/production-job.dto.ts`

```typescript
// NEW - Accepts string (including comma-separated values)
@IsString()
status?: string;
```

Now the backend accepts:
- Single status: `status=in_progress`
- Multiple statuses: `status=in_progress,queued,paused`

The service layer already handles splitting the comma-separated values correctly.

## Action Required

**RESTART THE BACKEND SERVER** for changes to take effect:

```bash
# Stop the current backend server (Ctrl+C)
# Then restart:
cd backend
npm run start:dev
```

## Testing

After restarting the backend:

1. Go to Shop Floor page
2. Click "Show All Jobs" button
3. Should now load without 400 error
4. Check browser console - error should be gone
5. Jobs should appear if any exist with status: queued, in_progress, or paused

## Expected Console Output (After Fix)

```javascript
Shop Floor Debug: {
  showAllJobs: true,
  isLoading: false,
  error: null,  // ✅ No more error!
  jobs: [...],  // Array of jobs if they exist
  allJobsResponse: { data: [...], total: X }
}
```

## If Still No Jobs Showing

After the error is fixed, if you still see empty jobs array, it means:
1. No production jobs exist yet
2. No jobs have status: queued, in_progress, or paused

**Follow the workflow**:
1. Orders page → Create order → Approve it
2. Planning page → Create production job
3. Production page → Start the job
4. Shop Floor page → Should now see the job

## Build Status
- ✅ Backend built successfully
- ✅ Frontend built successfully
- ⏳ Backend server needs restart

## Date Fixed
2026-03-03
