# Troubleshooting Guide

## Authentication Issues

### 401 Unauthorized on Login
**Symptoms**: Login fails, "Invalid credentials" error

**Solutions**:
1. Verify email and password are correct
2. Check user exists in database: `SELECT * FROM users WHERE email = 'email@example.com';`
3. Verify user is active: `is_active = true`

### 401 Unauthorized on API Calls
**Symptoms**: API returns 401, "Unauthorized"

**Solutions**:
1. Check token in localStorage: `localStorage.getItem('access_token')`
2. Verify token is not expired: decode JWT at jwt.io
3. Check Authorization header is sent: `Authorization: Bearer <token>`
4. Refresh token if expired: `POST /api/auth/refresh`
5. Login again if refresh fails

### 403 Forbidden
**Symptoms**: API returns 403, "Forbidden"

**Solutions**:
1. Check user role has permission for endpoint
2. Verify user belongs to correct company
3. Check `X-Company-ID` header matches user's company
4. For super-admin operations, verify `is_super_admin = true`

## Multi-Tenant Issues

### 404 Not Found (Data Exists)
**Symptoms**: Record exists but returns 404

**Solutions**:
1. Verify `X-Company-ID` header is sent
2. Check header value matches current company_id
3. Verify record belongs to correct company
4. Check record is not soft-deleted: `is_active = true`

### Data Visible in Wrong Company
**Symptoms**: Customer/order visible in Company A and Company B

**Solutions**:
1. Check service method filters by `company_id`
2. Verify query includes `WHERE company_id = :companyId`
3. Check controller passes `user.company_id` to service

## API Issues

### 400 Bad Request
**Symptoms**: POST/PUT returns 400, "Bad Request"

**Solutions**:
1. Check DTO field names match request body
2. Verify decorator order (especially `@IsOptional()` first)
3. Ensure required fields are present
4. Check type coercion for numbers/booleans/dates
5. Verify enum values are correct

### 409 Conflict
**Symptoms**: POST returns 409, "Conflict"

**Solutions**:
1. Check for duplicate email in same company
2. Verify unique constraints
3. Use different value or update existing record

### 500 Internal Server Error
**Symptoms**: API returns 500, "Internal Server Error"

**Solutions**:
1. Check backend logs: `npm run start:dev` output
2. Verify database connection
3. Check for null pointer exceptions in service
4. Verify all required fields are provided

## Database Issues

### Connection Refused
**Symptoms**: "connect ECONNREFUSED 127.0.0.1:5432"

**Solutions**:
1. Start PostgreSQL: `brew services start postgresql` (macOS) or `sudo service postgresql start` (Linux)
2. Verify connection string in `.env`
3. Check PostgreSQL is running: `psql -U postgres -c "SELECT 1;"`

### Migration Failed
**Symptoms**: "Migration failed" error

**Solutions**:
1. Check migration file syntax
2. Verify database exists
3. Check for conflicting migrations
4. Rollback and retry: `npm run typeorm migration:revert`

## Frontend Issues

### Port 5173 Already in Use
**Symptoms**: "Port 5173 is already in use"

**Solutions**:
1. Kill process: `lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9`
2. Use different port: `npm run dev -- --port 5174`

### Blank Page / No Content
**Symptoms**: Frontend loads but shows blank page

**Solutions**:
1. Check browser console for errors: F12 → Console tab
2. Verify API URL in `.env.local`
3. Check backend is running: `curl http://localhost:3000/api/health`
4. Clear browser cache: Ctrl+Shift+Delete

### CORS Error
**Symptoms**: "Access to XMLHttpRequest blocked by CORS policy"

**Solutions**:
1. Verify backend CORS config allows frontend origin
2. Check headers are sent correctly
3. Verify backend is running on correct port

## Backend Issues

### Port 3000 Already in Use
**Symptoms**: "listen EADDRINUSE :::3000"

**Solutions**:
1. Kill process: `lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9`
2. Use different port: `PORT=3001 npm run start:dev`

### Module Not Found
**Symptoms**: "Cannot find module '@nestjs/common'"

**Solutions**:
1. Install dependencies: `npm install`
2. Clear node_modules: `rm -rf node_modules && npm install`

### TypeScript Compilation Error
**Symptoms**: "error TS2307: Cannot find module"

**Solutions**:
1. Check import path is correct
2. Verify file exists at path
3. Rebuild: `npm run build`

## Tailwind CSS Issues

### Styles Not Applying
**Symptoms**: Tailwind classes not working, build errors

**Solutions**:
1. Check `vite.config.ts` uses `@tailwindcss/vite` plugin (NOT PostCSS)
2. Check `index.css` uses `@import "tailwindcss";` (NOT `@tailwind` directives)
3. Ensure no `tailwind.config.js` or `postcss.config.js` exists
3. Verify numeric fields are converted: `Number(value)`
4. Verify dates are ISO strings: `new Date(date).toISOString()`

## Production SSL Errors

**Symptom:** Database connection fails in production

**Solutions:**
1. Verify `NODE_ENV=production` is set
2. Check database hostname (SSL auto-enables for Neon)
3. Verify `ssl: { rejectUnauthorized: false }` in database config

## Build Failures

**Symptom:** `npm run build` fails

**Solutions:**
1. Run `npm run lint` to check for TypeScript errors
2. Ensure all imports are correct
3. Check for missing dependencies: `npm install`

## Production Stage Tracking Issues

**Symptom:** Previous stage not completing when starting new stage

**Solution:** This is expected behavior. Starting a new stage auto-completes the previous stage. Don't manually complete stages before starting the next one unless you need to add specific notes or waste quantity.

## Queue Position Not Updating

**Symptom:** Queue positions seem incorrect

**Solution:** Queue positions are auto-calculated. Never set manually. They recalculate when jobs change from `queued` to `in_progress` status.

## Inline Status Not Updating

**Symptom:** `inline_status` field shows old value

**Solution:** `inline_status` is auto-generated. Never set manually. It updates automatically when `current_stage`, `current_process`, or `assigned_machine` changes.
