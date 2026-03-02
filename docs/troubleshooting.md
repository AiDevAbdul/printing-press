# Troubleshooting

## Tailwind CSS Not Working

**Symptom:** Styles not applying, build errors

**Solution:** Verify Tailwind v4 setup:
1. Check `vite.config.ts` uses `@tailwindcss/vite` plugin (NOT PostCSS)
2. Check `index.css` uses `@import "tailwindcss";` (NOT `@tailwind` directives)
3. Ensure no `tailwind.config.js` or `postcss.config.js` exists

## PostgreSQL Port Conflict

**Symptom:** `EADDRINUSE` error on port 5432

**Solution (Windows):**
```bash
taskkill //F //IM postgres.exe
```

## Migration Errors

**Symptom:** Migration fails to run

**Solutions:**
1. Ensure PostgreSQL is running
2. Verify `.env` database credentials
3. Check `synchronize: false` in database config
4. Run migrations after pulling schema changes:
   ```bash
   cd backend
   npm run migration:run
   ```

## 401 Unauthorized Errors

**Symptom:** API calls return 401 after login

**Solutions:**
1. Clear localStorage and re-login
2. Check token expiration (access: 1h, refresh: 7d)
3. Verify JWT_SECRET matches between sessions

## Form Validation Errors

**Symptom:** Form submission fails with validation error

**Solutions:**
1. Open browser console for exact error message
2. Check DTO field names match (e.g., `postal_code` not `pincode`)
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
