# Deployment Guide: Neon + Render + Vercel

This guide will help you deploy the Printing Press Management System using:
- **Neon** - PostgreSQL Database (Free tier)
- **Render** - Backend API (Free tier)
- **Vercel** - Frontend (Free tier)

## Prerequisites

- GitHub account (already done ✓)
- Neon account (https://neon.tech)
- Render account (https://render.com)
- Vercel account (https://vercel.com)

---

## Step 1: Deploy Database on Neon

### 1.1 Create Neon Database

1. Go to https://neon.tech and sign up/login
2. Click "Create Project"
3. Name: `printing-press-db`
4. Region: Choose closest to your users
5. Click "Create Project"

### 1.2 Get Connection String

1. In your Neon dashboard, click on your project
2. Go to "Connection Details"
3. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 1.3 Run Migrations

On your local machine:

```bash
cd backend

# Update .env with Neon connection string
# Parse the connection string:
# postgresql://username:password@host:5432/database

# Example:
DB_HOST=ep-xxx.us-east-2.aws.neon.tech
DB_PORT=5432
DB_USERNAME=username
DB_PASSWORD=password
DB_DATABASE=neondb

# Run migrations
npm run migration:run
```

---

## Step 2: Deploy Backend on Render

### 2.1 Create Web Service

1. Go to https://render.com and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `AiDevAbdul/printing-press`
4. Configure:
   - **Name**: `printing-press-api`
   - **Region**: Same as Neon (or closest)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Instance Type**: Free

### 2.2 Add Environment Variables

In Render dashboard, go to "Environment" tab and add:

```
NODE_ENV=production
PORT=3000

# Database (from Neon)
DB_HOST=ep-xxx.us-east-2.aws.neon.tech
DB_PORT=5432
DB_USERNAME=your-neon-username
DB_PASSWORD=your-neon-password
DB_DATABASE=neondb

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_REFRESH_EXPIRATION=7d
```

**Generate secure secrets:**
```bash
# On your local machine
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.3 Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Your API will be available at: `https://printing-press-api.onrender.com`

### 2.4 Test Backend

```bash
curl https://printing-press-api.onrender.com/api/health
```

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Update Frontend Environment

1. In your local `frontend/.env.example`, update:
   ```
   VITE_API_BASE_URL=https://printing-press-api.onrender.com/api
   ```

2. Commit and push:
   ```bash
   git add frontend/.env.example
   git commit -m "Update API URL for production"
   git push origin main
   ```

### 3.2 Deploy to Vercel

1. Go to https://vercel.com and sign up/login
2. Click "Add New..." → "Project"
3. Import `AiDevAbdul/printing-press`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Add Environment Variable

In Vercel project settings → Environment Variables:

```
VITE_API_BASE_URL=https://printing-press-api.onrender.com/api
```

### 3.4 Deploy

1. Click "Deploy"
2. Wait for deployment (2-3 minutes)
3. Your app will be available at: `https://printing-press-xxx.vercel.app`

---

## Step 4: Verify Deployment

### 4.1 Test Backend API

```bash
# Health check
curl https://printing-press-api.onrender.com/api/health

# Login (default admin)
curl -X POST https://printing-press-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@printingpress.com","password":"admin123"}'
```

### 4.2 Test Frontend

1. Open your Vercel URL: `https://printing-press-xxx.vercel.app`
2. Login with:
   - Email: `admin@printingpress.com`
   - Password: `admin123`
3. Test creating an order with the new multi-step form

---

## Important Notes

### Free Tier Limitations

**Neon (Free)**
- 0.5 GB storage
- 1 project
- Auto-suspend after 5 minutes of inactivity

**Render (Free)**
- Spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month

**Vercel (Free)**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS

### Production Recommendations

1. **Change Default Password**: Immediately change the admin password after first login
2. **Update JWT Secrets**: Use strong, unique secrets (32+ characters)
3. **Enable CORS**: Backend already configured for production
4. **Monitor Logs**: Check Render and Vercel logs regularly
5. **Backup Database**: Neon provides automatic backups on paid plans

### Troubleshooting

**Backend not responding:**
- Check Render logs
- Verify environment variables
- Ensure database connection is correct

**Frontend can't connect to backend:**
- Verify VITE_API_BASE_URL is correct
- Check CORS settings in backend
- Ensure backend is running (not spun down)

**Database connection errors:**
- Verify Neon connection string
- Check if database is active (not suspended)
- Ensure SSL mode is enabled

---

## Custom Domain (Optional)

### For Frontend (Vercel)
1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### For Backend (Render)
1. Go to Render service → Settings → Custom Domain
2. Add your custom domain
3. Update DNS records as instructed

---

## Monitoring & Maintenance

### Render
- Dashboard: https://dashboard.render.com
- View logs, metrics, and deployment history

### Vercel
- Dashboard: https://vercel.com/dashboard
- View analytics, deployments, and logs

### Neon
- Dashboard: https://console.neon.tech
- Monitor database usage and performance

---

## Deployment Checklist

- [ ] Neon database created
- [ ] Migrations run successfully
- [ ] Backend deployed on Render
- [ ] Environment variables configured
- [ ] Backend health check passes
- [ ] Frontend deployed on Vercel
- [ ] Frontend can connect to backend
- [ ] Login works
- [ ] Order creation works
- [ ] Default admin password changed

---

## Support

If you encounter issues:
1. Check the logs in Render/Vercel dashboards
2. Verify all environment variables are set correctly
3. Ensure database is active and accessible
4. Check GitHub repository for updates

---

## Next Steps

After successful deployment:
1. Change default admin password
2. Create additional users with appropriate roles
3. Add customers and test the full workflow
4. Monitor application performance
5. Set up regular database backups (paid plan)
