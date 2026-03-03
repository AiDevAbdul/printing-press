# Shop Floor Fix - Show In-Progress Jobs

## Issue
Shop Floor page was not showing in-progress jobs because it only displayed jobs assigned to the currently logged-in operator.

## Root Cause
The Shop Floor page called `getMyActiveJobs()` endpoint which filters jobs by:
1. `assigned_operator.id = current user`
2. `status IN ('queued', 'in_progress')`

**Problems**:
- If no operator was assigned during job creation, the job wouldn't appear
- If a different operator was assigned, the job wouldn't appear for other users
- Users couldn't see all active jobs in the shop floor

## Solution Implemented

### 1. Backend - Support Multiple Status Filters
**File**: `backend/src/production/production.service.ts`

Updated `findAllWithFilters()` method to support comma-separated statuses:
```typescript
// Status filter - support multiple statuses separated by comma
if (queryDto.status) {
  const statuses = queryDto.status.toString().split(',').map(s => s.trim());
  if (statuses.length > 1) {
    queryBuilder.andWhere('job.status IN (:...statuses)', { statuses });
  } else {
    queryBuilder.andWhere('job.status = :status', { status: queryDto.status });
  }
}
```

**Usage**: `GET /api/production/jobs?status=in_progress,queued,paused`

### 2. Frontend - Add "Show All Jobs" Toggle
**File**: `frontend/src/pages/shop-floor/ShopFloor.tsx`

**Added Features**:
- Toggle button to switch between "My Jobs" and "All Jobs"
- Two separate queries:
  - **My Jobs**: Uses `getMyActiveJobs()` - shows only jobs assigned to current user
  - **All Jobs**: Uses `GET /api/production/jobs?status=in_progress,queued,paused` - shows all active jobs
- Display operator name when showing all jobs
- Better empty state messages

**UI Changes**:
- Added toggle button in header: "Show All Jobs" / "Show My Jobs"
- Shows operator name in job card when viewing all jobs
- Updated empty state to suggest toggling view

### 3. TypeScript Interface Update
**File**: `frontend/src/services/shop-floor.service.ts`

Updated `ProductionJob` interface to include:
- `assigned_operator` field (optional)
- `customer.name` field (fallback when company_name is empty)

## How It Works Now

### Default View - "My Jobs"
- Shows only jobs assigned to the logged-in operator
- Filters: `assigned_operator = current user` AND `status IN ('queued', 'in_progress')`
- Useful for operators to focus on their assigned work

### Toggle View - "All Jobs"
- Shows all active jobs regardless of operator assignment
- Filters: `status IN ('in_progress', 'queued', 'paused')`
- Displays operator name for each job
- Useful for supervisors and when operators need to see all shop floor activity

## Testing Checklist

- [x] Frontend builds without errors
- [x] Backend builds without errors
- [ ] Test "My Jobs" view shows only assigned jobs
- [ ] Test "All Jobs" view shows all active jobs
- [ ] Test toggle button switches between views correctly
- [ ] Test jobs without assigned operators appear in "All Jobs" view
- [ ] Test operator name displays correctly in "All Jobs" view
- [ ] Test empty states show appropriate messages

## Benefits

1. **Flexibility**: Users can choose between focused view (my jobs) or comprehensive view (all jobs)
2. **Visibility**: All active jobs are now visible when needed
3. **No Breaking Changes**: Default behavior (My Jobs) remains the same
4. **Better UX**: Clear toggle button and contextual empty states
5. **Supervisor Support**: Supervisors can see all shop floor activity

## API Endpoints Used

- `GET /api/production/shop-floor/my-jobs` - Get jobs assigned to current user
- `GET /api/production/jobs?status=in_progress,queued,paused` - Get all active jobs

## Notes

- The toggle state is not persisted (resets on page refresh)
- Jobs are auto-refreshed every 10 seconds in both views
- Paused jobs are included in "All Jobs" view for better visibility
