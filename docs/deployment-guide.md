# 🚀 Deployment Guide

**Complete guide for deploying the Printing Press Management System**

**Last Updated:** March 2, 2026

---

## 📋 Table of Contents

1. [Quick Start (15 minutes)](#quick-start)
2. [Detailed Deployment Steps](#detailed-deployment)
3. [Troubleshooting](#troubleshooting)
4. [Monitoring & Maintenance](#monitoring)

---

## Quick Start

### Prerequisites
- GitHub account
- [Neon](https://neon.tech) account (PostgreSQL)
- [Render](https://render.com) account (Backend)
- [Vercel](https://vercel.com) account (Frontend)

### Deployment Stack (All Free Tier)
- 🗄️ **Database**: Neon PostgreSQL (0.5 GB storage)
- 🔧 **Backend**: Render (750 hours/month)
- 🌐 **Frontend**: Vercel (100 GB bandwidth/month)

---

## Detailed Deployment

### Step 1: Database - Neon (5 minutes)

#### 1.1 Create Database

1. Go to https://neon.tech and sign up/login
2. Click "Create Project"
3. Configure:
   - **Name**: `printing-press-db`
   - **Region**: Choose closest to your users
4. Click "Create Project"

#### 1.2 Get Connection String

1. In Neon dashboard, click your project
2. Go to "Connection Details"
3. Copy the connection string:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

#### 1.3 Run Migrations

On your local machine:

```bash
cd backend

# Parse connection string and update .env:
# postgresql://username:password@host:5432/database

DB_HOST=ep-xxx.region.aws.neon.tech
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_DATABASE=neondb

# Run migrations
npm run migration:run
```

**Expected Output:**
```
Migration CreateUsers1234567890123 has been executed successfully.
Migration CreateCustomers1234567890124 has been executed successfully.
...
17 migrations executed successfully
```

---

### Step 2: Backend - Render (5 minutes)

#### 2.1 Create Web Service

1. Go to https://render.com and sign up/login
2. Click "New +" → "Web Service"
3. Connect GitHub repository: `AiDevAbdul/printing-press`
4. Configure:
   - **Name**: `printing-press-api`
   - **Region**: Same as Neon (or closest)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Instance Type**: Free

#### 2.2 Environment Variables

Click "Environment" tab and add:

```env
NODE_ENV=production
PORT=3000

# Database (from Neon)
DB_HOST=ep-xxx.region.aws.neon.tech
DB_PORT=5432
DB_USERNAME=your-neon-username
DB_PASSWORD=your-neon-password
DB_DATABASE=neondb

# JWT Secrets (generate using command below)
JWT_SECRET=your-32-char-secret-here
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your-32-char-refresh-secret-here
JWT_REFRESH_EXPIRATION=7d
```

**Generate Secure Secrets:**
```bash
# Run twice to get two different secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 2.3 Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Your API will be at: `https://printing-press-api.onrender.com`

#### 2.4 Verify Backend

```bash
# Health check
curl https://printing-press-api.onrender.com/api/auth/login

# Expected: 400 error (means API is working, just missing credentials)
```

---

### Step 3: Frontend - Vercel (5 minutes)

#### 3.1 Deploy to Vercel

1. Go to https://vercel.com and sign up/login
2. Click "Add New..." → "Project"
3. Import: `AiDevAbdul/printing-press`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### 3.2 Environment Variable

In Vercel project settings → Environment Variables:

```env
VITE_API_BASE_URL=https://printing-press-api.onrender.com/api
```

#### 3.3 Deploy

1. Click "Deploy"
2. Wait for deployment (2-3 minutes)
3. Your app will be at: `https://printing-press-xxx.vercel.app`

---

### Step 4: Verification

#### 4.1 Test Backend

```bash
# Health check
curl https://printing-press-api.onrender.com/api/auth/login

# Login test
curl -X POST https://printing-press-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@printingpress.com","password":"admin123"}'
```

#### 4.2 Test Frontend

1. Open your Vercel URL
2. Login with default credentials:
   - **Email**: `admin@printingpress.com`
   - **Password**: `admin123`
3. Test creating a customer
4. Test creating an order

---

## Troubleshooting

### Common Issues

#### 🔴 Backend Not Responding

**Symptoms:**
- Render shows "Application failed to respond"
- No response from API endpoints

**Solutions:**
1. **Wait 60 seconds** - Free tier has cold start (30-60s)
2. Check Render logs for errors
3. Verify environment variables are set correctly
4. Ensure `NODE_ENV=production` is set (required for SSL)

**Check Logs:**
- Go to Render Dashboard → Your Service → Logs
- Look for: `Application is running on: http://[::]:3000`

---

#### 🔴 SSL Connection Error

**Error:**
```
error: connection is insecure (try using sslmode=require)
```

**Cause:** Neon requires SSL connections in production

**Solution:** Already fixed in codebase. Ensure `NODE_ENV=production` is set in Render.

**Verification:**
```typescript
// backend/src/config/database.config.ts
ssl: process.env.NODE_ENV === 'production' || process.env.DB_HOST?.includes('neon.tech')
  ? { rejectUnauthorized: false }
  : false,
```

---

#### 🔴 Frontend Can't Connect to Backend

**Symptoms:**
- Login fails
- Network errors in browser console
- CORS errors

**Solutions:**
1. Verify `VITE_API_BASE_URL` in Vercel environment variables
2. Ensure backend URL ends with `/api`
3. Check backend is running (not spun down)
4. Verify CORS is enabled in backend (already configured)

**Test Backend:**
```bash
curl https://your-backend.onrender.com/api/auth/login
```

---

#### 🔴 Database Connection Failed

**Symptoms:**
- Backend logs show connection errors
- TypeORM initialization fails

**Solutions:**
1. Verify Neon database is active (not suspended)
2. Check connection string is correct
3. Ensure all DB_* environment variables are set
4. Verify SSL mode is enabled

**Test Connection Locally:**
```bash
psql "postgresql://user:pass@host/neondb?sslmode=require"
```

---

#### 🔴 Migration Errors

**Symptoms:**
- Tables not created
- Migration failed errors

**Solutions:**
1. Run migrations locally first (before deploying)
2. Verify `synchronize: false` in database config
3. Check migration files exist in `backend/src/migrations/`

**Run Migrations:**
```bash
cd backend
npm run migration:run
```

---

#### 🔴 JWT Authentication Errors

**Symptoms:**
- 401 Unauthorized errors
- "JWT must be provided" errors

**Solutions:**
1. Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set in Render
2. Ensure secrets are at least 32 characters
3. Check frontend is sending tokens correctly

**Generate New Secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

#### 🔴 Build Failures

**Error:**
```
Cannot find module 'dist/main'
```

**Solutions:**
1. Verify build command: `npm install && npm run build`
2. Check `tsconfig.json` has `outDir: "dist"`
3. Ensure all dependencies are in `package.json`

**Test Build Locally:**
```bash
cd backend
npm run build
npm run start:prod
```

---

### Free Tier Limitations

#### Render (Backend)
- ⏱️ Spins down after 15 minutes of inactivity
- 🐌 Cold start: 30-60 seconds
- ⏰ 750 hours/month (sufficient for 24/7 with one service)

#### Neon (Database)
- 💤 Auto-suspends after 5 minutes of inactivity
- ⚡ Instant wake-up
- 💾 0.5 GB storage limit
- 🔗 1 project on free tier

#### Vercel (Frontend)
- 📊 100 GB bandwidth/month
- 🚀 Unlimited deployments
- 🔒 Automatic HTTPS & CDN

---

## Monitoring

### What to Monitor

#### Render Dashboard
- CPU usage
- Memory usage
- Response times
- Error rates
- Deployment history

#### Neon Dashboard
- Database size (0.5 GB limit)
- Active connections
- Query performance
- Storage usage

#### Application Logs
- Authentication failures
- Database errors
- API errors
- Slow queries

### Health Checks

**Backend Health:**
```bash
curl https://your-backend.onrender.com/api/auth/login
```

**Database Health:**
```bash
psql "your-connection-string" -c "SELECT 1;"
```

---

## Security Checklist

After deployment:

- [ ] Change default admin password (`admin123`)
- [ ] Verify JWT secrets are strong (32+ characters)
- [ ] Confirm SSL is enabled (check logs)
- [ ] Test unauthorized requests return 401
- [ ] Verify role-based access control works
- [ ] Enable 2FA for hosting accounts
- [ ] Set up monitoring alerts

---

## Deployment Checklist

- [ ] Neon database created
- [ ] Migrations run successfully (17/17)
- [ ] Backend deployed on Render
- [ ] All environment variables configured
- [ ] Backend health check passes
- [ ] Frontend deployed on Vercel
- [ ] Frontend can connect to backend
- [ ] Login works with default credentials
- [ ] Order creation works
- [ ] Default admin password changed

---

## Custom Domain (Optional)

### Frontend (Vercel)
1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

### Backend (Render)
1. Go to Render service → Settings → Custom Domain
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

---

## Redeployment

### Automatic (Recommended)
```bash
git add .
git commit -m "Your changes"
git push origin main
# Render auto-deploys in 3-5 minutes
```

### Manual
1. Go to Render Dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

---

## Emergency Procedures

### Rollback Deployment
```bash
git revert HEAD
git push origin main
# Render auto-deploys previous version
```

### Database Backup
```bash
# Export database
pg_dump "your-connection-string" > backup.sql

# Restore database
psql "your-connection-string" < backup.sql
```

---

## Support Resources

**Render:**
- Documentation: https://render.com/docs
- Troubleshooting: https://render.com/docs/troubleshooting-deploys

**Neon:**
- Documentation: https://neon.tech/docs
- Connection Errors: https://neon.tech/docs/connect/connection-errors

**Vercel:**
- Documentation: https://vercel.com/docs
- Troubleshooting: https://vercel.com/docs/errors

---

## Next Steps

After successful deployment:

1. ✅ Change default admin password
2. ✅ Create additional users with roles
3. ✅ Add customers
4. ✅ Test complete workflow (quotation → order → production → delivery)
5. ✅ Monitor application performance
6. ✅ Set up regular database backups (paid plan)
7. ✅ Configure custom domain (optional)

---

## Default Credentials

**Email:** `admin@printingpress.com`
**Password:** `admin123`

⚠️ **CRITICAL:** Change this password immediately after first login!

---

**Deployment Status:** ✅ All systems operational
**Last Verified:** March 2, 2026
