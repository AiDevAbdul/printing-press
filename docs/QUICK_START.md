# Quick Start Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

## Setup

### Backend
```bash
cd backend
npm install
npm run typeorm migration:run
npm run start:dev
```
Backend runs on `http://localhost:3000/api`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

## Default Credentials
- **Email**: `admin@printingpress.com`
- **Password**: `admin123`
- **Role**: Super-admin (access all 4 companies)

## First Steps
1. Login with admin credentials
2. Select a company from the company selector page
3. You'll be redirected to the admin dashboard
4. Use the header company switcher to switch between companies

## Companies
1. Capital Packages
2. CPP Pre Press
3. BEST FOIL
4. SILVO Enterprises

## Key Endpoints
- `POST /api/auth/login` - Login
- `POST /api/auth/select-company` - Select company (super-admin only)
- `GET /api/customers` - List customers
- `GET /api/orders` - List orders
- `GET /api/production/jobs` - List production jobs

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/printing_press
JWT_SECRET=your-secret-key
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:3000/api
```

## Troubleshooting

**401 Unauthorized**: Missing or invalid JWT token
- Solution: Login again, check token in localStorage

**400 Bad Request on API calls**: Missing `X-Company-ID` header
- Solution: Frontend interceptor should add this automatically; check network tab

**Database connection error**: PostgreSQL not running
- Solution: Start PostgreSQL service

**Port already in use**: Another process using port 3000 or 5173
- Solution: Kill the process or change port in config

## Next Steps
- Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Read [MULTI_TENANT.md](MULTI_TENANT.md) for multi-company details
- Read [API_CONVENTIONS.md](API_CONVENTIONS.md) for API patterns
