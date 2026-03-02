# 🔧 Deployment Troubleshooting Guide

**Last Updated:** February 24, 2026, 14:37 UTC

---

## 🚨 Common Deployment Issues

### 1. SSL Connection Error (FIXED ✅)

**Error:**
```
error: connection is insecure (try using `sslmode=require`)
```

**Cause:** Neon PostgreSQL requires SSL connections in production.

**Solution:** Updated `backend/src/config/database.config.ts` to enable SSL when `NODE_ENV=production`:

```typescript
ssl: process.env.NODE_ENV === 'production' || process.env.DB_HOST?.includes('neon.tech')
  ? { rejectUnauthorized: false }
  : false,
```

**Status:** Fixed in commit `71b5bde` - Render will auto-redeploy

---

## 📋 Render Deployment Checklist

### Environment Variables Required

Ensure all these are set in Render dashboard:

```env
NODE_ENV=production                    ✅ CRITICAL for SSL
PORT=3000
DB_HOST=ep-polished-tooth-aiqerh2d-pooler.c-4.us-east-1.aws.neon.tech
DB_PORT=5432
DB_USERNAME=neondb_owner
DB_PASSWORD=npg_gxyu4X1bsBSe
DB_DATABASE=neondb
JWT_SECRET=[32+ character random string]
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=[32+ character random string]
JWT_REFRESH_EXPIRATION=7d
```

### Generate JWT Secrets

Run locally:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run twice to get two different secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

---

## 🔍 Debugging Steps

### 1. Check Render Logs

Go to: Render Dashboard → Your Service → Logs

Look for:
- ✅ `[Nest] Starting Nest application...`
- ✅ `Application is running on: http://[::]:3000`
- ❌ Any error messages

### 2. Verify Database Connection

The logs should show:
```
[InstanceLoader] TypeOrmModule dependencies initialized
```

If you see connection errors, verify:
- Neon database is active (not suspended)
- Environment variables are correct
- SSL is enabled in config

### 3. Test Backend Health

Once deployed, test:
```bash
curl https://your-app.onrender.com/api/auth/login
```

Expected response (400 is OK - means API is working):
```json
{"statusCode":400,"message":["email should not be empty"]...}
```

---

## 🐛 Common Errors & Solutions

### Error: "Application failed to respond"

**Symptoms:**
- Render shows "Application failed to respond"
- No logs after "Running 'npm run start:prod'"

**Solutions:**
1. Wait 60 seconds (cold start on free tier)
2. Check if `PORT=3000` is set in environment variables
3. Verify build completed successfully
4. Check for any startup errors in logs

---

### Error: "Cannot find module"

**Symptoms:**
```
Error: Cannot find module 'dist/main'
```

**Solutions:**
1. Verify build command: `npm install && npm run build`
2. Check that `dist/` directory is created during build
3. Ensure `tsconfig.json` has correct `outDir: "dist"`

---

### Error: "Migration failed"

**Symptoms:**
- Database connection works but migrations fail
- Tables not created

**Solutions:**
1. Migrations should already be run on Neon (9/9 complete)
2. If needed, run manually:
   ```bash
   npm run migration:run
   ```
3. Verify `synchronize: false` in database config

---

### Error: "JWT must be provided"

**Symptoms:**
- Frontend can't authenticate
- 401 errors on all requests

**Solutions:**
1. Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set in Render
2. Ensure secrets are at least 32 characters
3. Check frontend `VITE_API_BASE_URL` points to correct Render URL

---

## 🔐 Security Checklist

After successful deployment:

- [ ] Change default admin password (`admin123`)
- [ ] Verify JWT secrets are strong (32+ characters)
- [ ] Confirm SSL is enabled (check logs for SSL connection)
- [ ] Test that unauthorized requests return 401
- [ ] Verify role-based access control works

---

## 📊 Monitoring

### What to Monitor

1. **Render Dashboard:**
   - CPU usage
   - Memory usage
   - Response times
   - Error rates

2. **Neon Dashboard:**
   - Database size (0.5 GB limit on free tier)
   - Active connections
   - Query performance

3. **Application Logs:**
   - Authentication failures
   - Database errors
   - API errors

### Free Tier Limitations

**Render:**
- Spins down after 15 min inactivity
- 30-60s cold start time
- 750 hours/month (sufficient for 24/7 with one service)

**Neon:**
- Auto-suspends after 5 min inactivity
- 0.5 GB storage limit
- Instant wake-up

---

## 🆘 Emergency Procedures

### If Deployment Fails Completely

1. **Rollback to previous commit:**
   ```bash
   git revert HEAD
   git push
   ```

2. **Check Render build logs** for specific errors

3. **Verify environment variables** are all set correctly

4. **Test locally first:**
   ```bash
   cd backend
   npm run build
   npm run start:prod
   ```

### If Database Connection Fails

1. **Check Neon status:** https://neon.tech/status
2. **Verify connection string** in Render environment variables
3. **Test connection locally:**
   ```bash
   psql "postgresql://neondb_owner:npg_gxyu4X1bsBSe@ep-polished-tooth-aiqerh2d-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```

---

## 📞 Support Resources

**Render Documentation:**
- https://render.com/docs
- https://render.com/docs/troubleshooting-deploys

**Neon Documentation:**
- https://neon.tech/docs
- https://neon.tech/docs/connect/connection-errors

**NestJS Documentation:**
- https://docs.nestjs.com/techniques/database
- https://docs.nestjs.com/security/authentication

---

## ✅ Successful Deployment Indicators

Your deployment is successful when:

1. ✅ Render shows "Live" status (green)
2. ✅ Logs show: `Application is running on: http://[::]:3000`
3. ✅ Health check responds: `curl https://your-app.onrender.com/api/auth/login`
4. ✅ No error messages in logs
5. ✅ Database connection established
6. ✅ Frontend can communicate with backend

---

## 🔄 Redeployment Process

If you need to redeploy:

1. **Automatic (recommended):**
   - Push to GitHub main branch
   - Render auto-deploys in ~3-5 minutes

2. **Manual:**
   - Go to Render Dashboard
   - Click "Manual Deploy" → "Deploy latest commit"

3. **With changes:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   # Render auto-deploys
   ```

---

## 📝 Deployment History

| Date | Commit | Issue | Resolution |
|------|--------|-------|------------|
| 2026-02-24 14:27 | 24f0599 | SSL connection error | Fixed in 71b5bde |
| 2026-02-24 14:37 | 71b5bde | SSL config updated | ✅ Deployed |

---

**Next Steps After Successful Deployment:**

1. Test backend health check
2. Deploy frontend to Vercel
3. Test full application flow
4. Change admin password
5. Create test data

---

**Status:** Backend deployment in progress with SSL fix applied.
**Expected:** Deployment should succeed within 3-5 minutes.
