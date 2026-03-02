# Quick Deployment Steps

## 🚀 Your project is ready to deploy!

Repository: https://github.com/AiDevAbdul/printing-press

---

## Step-by-Step Deployment (15 minutes)

### 1️⃣ Database - Neon (5 min)

1. Go to https://neon.tech
2. Sign up/Login
3. Create new project: `printing-press-db`
4. Copy connection string
5. Run migrations locally:
   ```bash
   cd backend
   # Update .env with Neon credentials
   npm run migration:run
   ```

**Connection String Format:**
```
postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

---

### 2️⃣ Backend - Render (5 min)

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub: `AiDevAbdul/printing-press`
4. Settings:
   - Root Directory: `backend`
   - Build: `npm install && npm run build`
   - Start: `npm run start:prod`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   DB_HOST=<from-neon>
   DB_PORT=5432
   DB_USERNAME=<from-neon>
   DB_PASSWORD=<from-neon>
   DB_DATABASE=neondb
   JWT_SECRET=<generate-32-char-random>
   JWT_EXPIRATION=1h
   JWT_REFRESH_SECRET=<generate-32-char-random>
   JWT_REFRESH_EXPIRATION=7d
   ```
6. Deploy!

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 3️⃣ Frontend - Vercel (5 min)

1. Go to https://vercel.com
2. New Project
3. Import: `AiDevAbdul/printing-press`
4. Settings:
   - Root Directory: `frontend`
   - Framework: Vite
   - Build: `npm run build`
   - Output: `dist`
5. Environment Variable:
   ```
   VITE_API_BASE_URL=https://your-render-app.onrender.com/api
   ```
6. Deploy!

---

## ✅ Verification

### Test Backend
```bash
curl https://your-render-app.onrender.com/api/health
```

### Test Frontend
1. Open Vercel URL
2. Login: `admin@printingpress.com` / `admin123`
3. Create a test order

---

## 🎯 Default Credentials

**Email:** admin@printingpress.com
**Password:** admin123

⚠️ **IMPORTANT:** Change this password immediately after first login!

---

## 📊 What You Get (Free Tier)

✅ **Neon Database**
- 0.5 GB storage
- PostgreSQL with all features
- Auto-suspend after 5 min inactivity

✅ **Render Backend**
- 750 hours/month
- Spins down after 15 min inactivity
- First request after spin-down: 30-60s

✅ **Vercel Frontend**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS & CDN

---

## 🔧 Troubleshooting

**Backend not responding?**
- Wait 60s (might be spinning up)
- Check Render logs
- Verify environment variables

**Frontend can't connect?**
- Check VITE_API_BASE_URL
- Ensure backend is running
- Check browser console

**Database errors?**
- Verify Neon connection string
- Check if database is active
- Ensure migrations ran

---

## 📚 Full Documentation

See `DEPLOYMENT.md` for detailed instructions and troubleshooting.

---

## 🎉 You're All Set!

Your Printing Press Management System is now deployed and accessible worldwide!

**Next Steps:**
1. Change admin password
2. Create users with different roles
3. Add customers
4. Test the multi-step order form
5. Explore all features

Need help? Check the logs in Render/Vercel dashboards.
