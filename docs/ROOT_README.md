# 🖨️ Printing Press Management System

A comprehensive full-stack management system for packaging/printing companies built with NestJS, React, and PostgreSQL.

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AiDevAbdul/printing-press)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## 🚀 Quick Deploy

**Ready to deploy in 15 minutes!** See [QUICK_DEPLOY.md](QUICK_DEPLOY.md)

**Deployment Stack:**
- 🗄️ Database: [Neon](https://neon.tech) (Free PostgreSQL)
- 🔧 Backend: [Render](https://render.com) (Free tier)
- 🌐 Frontend: [Vercel](https://vercel.com) (Free tier)

---

## ✨ Features

### Phase 1 (Completed) ✅
- **Enhanced Order Management** with 30+ product specification fields
- **Multi-Step Order Form** (5-step wizard with conditional fields)
- **Product Type Support**: CPP Carton, Silvo/Blister Foil, Bent Foil, Alu-Alu
- **Color Management**: CMYK + 4 Pantone colors
- **Finishing Options**: 8 varnish types, 5 lamination types
- **Pre-Press Tracking**: CTP info, die types, plate references
- **Design Approval Workflow**
- **Repeat Order Functionality**

### Core Modules
- 👥 **User Management** - Role-based access control (5 roles)
- 🏢 **Customer Management** - Complete customer database
- 📋 **Order Management** - Enhanced with CPP001 specifications
- 🏭 **Production Tracking** - Job scheduling and monitoring
- 📦 **Inventory Management** - Stock tracking and alerts
- 💰 **Job Costing** - Material, labor, machine costs
- 🧾 **Invoicing** - Invoice generation with GST
- 📊 **Dashboard** - Real-time analytics and metrics

---

## 🏗️ Project Structure

```
printing-press/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/        # Authentication & JWT
│   │   ├── users/       # User management
│   │   ├── customers/   # Customer management
│   │   ├── orders/      # Enhanced order management
│   │   ├── production/  # Production jobs
│   │   ├── inventory/   # Inventory & stock
│   │   ├── costing/     # Job costs & invoices
│   │   └── dashboard/   # Analytics
│   └── migrations/      # Database migrations (9 files)
│
├── frontend/            # React + Vite
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── hooks/       # Custom React hooks
│   └── dist/           # Build output
│
└── docs/               # Documentation
    ├── DEPLOYMENT.md   # Detailed deployment guide
    ├── QUICK_DEPLOY.md # Quick start guide
    └── CLAUDE.md       # Project instructions
```

---

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator & class-transformer
- **API**: RESTful with global `/api` prefix

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v7
- **HTTP Client**: Axios with interceptors

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or pnpm

### Quick Start

```bash
# Clone the repository
git clone https://github.com/AiDevAbdul/printing-press.git
cd printing-press

# Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm run migration:run
npm run start:dev

# Setup Frontend (in new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

**Default Login:**
- Email: `admin@printingpress.com`
- Password: `admin123`

---

## 📦 Deployment

### Option 1: One-Click Deploy (Recommended)

Follow [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for step-by-step instructions (15 minutes).

### Option 2: Manual Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment guide with troubleshooting.

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
PORT=3000
DB_HOST=your-neon-host
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_DATABASE=neondb
JWT_SECRET=your-32-char-secret
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your-32-char-refresh-secret
JWT_REFRESH_EXPIRATION=7d
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

---

## 📚 API Documentation

### Authentication
```bash
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

### Orders (Enhanced)
```bash
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PATCH  /api/orders/:id
DELETE /api/orders/:id
```

### Other Modules
- `/api/users` - User management
- `/api/customers` - Customer management
- `/api/production` - Production jobs
- `/api/inventory` - Inventory & stock
- `/api/costing` - Job costs & invoices
- `/api/dashboard` - Analytics

---

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all modules |
| **Sales** | Customer and order management |
| **Planner** | Production planning and scheduling |
| **Accounts** | Job costing and invoicing |
| **Inventory** | Inventory management |

---

## 🗄️ Database Schema

**9 Tables:**
- `users` - User accounts with roles
- `customers` - Customer information
- `orders` - Enhanced orders with 30+ specification fields
- `production_jobs` - Production scheduling
- `inventory_items` - Inventory catalog
- `stock_transactions` - Stock movements
- `job_costs` - Job costing details
- `invoices` - Invoice headers
- `invoice_items` - Invoice line items

**9 Migrations:**
All migrations are in `backend/src/migrations/` and ready to run.

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:cov      # With coverage
npm run test:e2e      # E2E tests

# Frontend tests
cd frontend
npm test
```

---

## 📋 Development Scripts

### Backend
```bash
npm run start:dev     # Development with hot reload
npm run start:debug   # Debug mode
npm run build         # Production build
npm run start:prod    # Production mode
npm run migration:run # Run migrations
```

### Frontend
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

---

## 🎯 Roadmap

### Phase 1 ✅ (Completed)
- Enhanced order management with product specifications
- Multi-step order form
- Product type support
- Color and finishing management

### Phase 2 🔄 (Planned)
- Multi-stage production tracking
- Job processing cards
- Stage-wise approvals

### Phase 3 🔄 (Planned)
- Material requisition system
- GRN tracking
- Store records

### Phase 4 🔄 (Planned)
- Delivery challan generation
- Dispatch management

### Phase 5 🔄 (Planned)
- Approval workflows
- Comprehensive reports
- PDF generation

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

ISC

---

## 🆘 Support

- 📖 [Deployment Guide](DEPLOYMENT.md)
- 🚀 [Quick Deploy](QUICK_DEPLOY.md)
- 📋 [Architecture](ARCHITECTURE.md)
- 🔧 [Project Instructions](CLAUDE.md)

---

## 📊 Project Stats

- **Lines of Code**: 24,762+
- **Files**: 130+
- **Modules**: 8 backend modules
- **Database Tables**: 9 tables
- **Migrations**: 9 migrations
- **Phase 1**: ✅ Complete

---

**Built with ❤️ using NestJS, React, PostgreSQL, and Claude Opus 4.6**

**Last Updated**: February 24, 2026
