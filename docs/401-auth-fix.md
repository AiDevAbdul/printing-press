# 401 Unauthorized Error - Authentication Issue

## Issue
Shop Floor page returns 401 Unauthorized error when trying to fetch jobs.

## Cause
Your authentication token has expired or is invalid.

## Solution

### Option 1: Logout and Login Again (Recommended)
1. Click the **"Logout"** button in the top right
2. Login again with your credentials
3. Go back to Shop Floor page
4. Should work now

### Option 2: Clear Browser Storage
1. Open browser console (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Expand **Local Storage** → `http://localhost:5173`
4. Delete `access_token` and `refresh_token`
5. Refresh page - you'll be redirected to login
6. Login again

### Option 3: Quick Console Fix
Open browser console (F12) and run:
```javascript
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
location.reload();
```

## After Re-login

1. Go to **Shop Floor** page
2. Check console - should see:
```javascript
Shop Floor Debug: {
  showAllJobs: false,
  isLoading: false,
  error: null,  // ✅ No error
  jobs: [],
  myJobs: []
}
```

3. Click **"Show All Jobs"** - should also work without errors

## Why This Happens

JWT tokens expire after a certain time (configured in backend as `JWT_EXPIRATION`). When expired:
- API returns 401 Unauthorized
- Frontend should auto-refresh token, but if refresh token also expired, you need to re-login

## Prevention

The system has automatic token refresh, but if both access and refresh tokens expire, you must re-login.

## Next Steps After Re-login

If you still see empty jobs after re-login and no errors:
1. **Create production jobs** following the workflow
2. **Orders** → Create & Approve
3. **Planning** → Create Job
4. **Production** → Start Job
5. **Shop Floor** → View Job

## Date
2026-03-03
