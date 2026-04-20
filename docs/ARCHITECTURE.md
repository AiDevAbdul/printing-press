# System Architecture

## Overview

Multi-tenant NestJS + React application with PostgreSQL backend. All data isolated by `company_id`.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS v4 + Vite
- **Backend**: NestJS + TypeORM + PostgreSQL 15
- **Auth**: JWT (access: 1h, refresh: 7d)
- **State**: TanStack Query (frontend), TypeORM (backend)

## Layers

### Frontend (http://localhost:5173)
- React Router v6 (protected routes)
- TanStack Query (server state + caching)
- Axios HTTP client (JWT interceptors)
- 30+ pages, 36+ components

### Backend (http://localhost:3000/api)
- API Gateway (CORS, validation, error handling)
- JWT Authentication Middleware
- 9 modules: Auth, Users, Customers, Orders, Production, Inventory, Costing, Dashboard, Common
- Each module: Controller, Service, Entity, DTOs

### Database (PostgreSQL 15)
- 40+ tables with UUID primary keys
- Foreign key constraints
- Enum types for status fields
- Indexed columns for performance

## Data Flow

```
User → Frontend → Axios (JWT + X-Company-ID headers)
                    ↓
              Backend API Gateway
                    ↓
         JWT Auth Middleware (validate token)
                    ↓
         Extract company_id from JWT
                    ↓
         Route to Module Controller
                    ↓
         Validate DTO (class-validator)
                    ↓
         Call Service (business logic)
                    ↓
         TypeORM Query (filter by company_id)
                    ↓
         PostgreSQL Database
                    ↓
         Return filtered results
                    ↓
         Frontend updates React Query cache
```

## Module Dependencies

```
AppModule
├── ConfigModule (global)
├── TypeOrmModule (database)
├── AuthModule → UsersModule
├── UsersModule
├── CustomersModule → UsersModule
├── OrdersModule → CustomersModule, UsersModule
├── ProductionModule → OrdersModule, UsersModule
├── InventoryModule → UsersModule
├── CostingModule → ProductionModule, InventoryModule
└── DashboardModule → all modules
```

## Security Layers

1. **CORS Protection** - Allowed origins configuration
2. **JWT Authentication** - Token validation on each request
3. **Role-Based Access Control** - 8 roles with specific permissions
4. **Input Validation** - class-validator DTOs
5. **Database Security** - Parameterized queries (TypeORM)
6. **Password Security** - bcrypt hashing (10 rounds)
7. **Multi-Tenant Isolation** - company_id filtering on all queries

## Data Flow Examples

### 1. User Login Flow
```
User → Login Page → auth.service.login()
                         ↓
                    POST /api/auth/login
                         ↓
                    AuthController
                         ↓
                    AuthService.login()
                         ↓
                    UsersService.findByEmail()
                         ↓
                    Database Query
                         ↓
                    Verify Password (bcrypt)
                         ↓
                    Generate JWT Tokens
                         ↓
                    Return tokens + user data
                         ↓
                    Store in localStorage
                         ↓
                    Redirect to Dashboard
```

### 2. Create Order Flow
```
User → Order Form → orderService.create()
                         ↓
                    POST /api/orders
                         ↓
                    OrdersController (with JWT Guard)
                         ↓
                    Validate DTO (class-validator)
                         ↓
                    OrdersService.create()
                         ↓
                    Generate order_number
                         ↓
                    Create Order Entity
                         ↓
                    Save to Database
                         ↓
                    Return Order Object
                         ↓
                    Update UI (React Query cache)
```

### 3. Production Job Flow
```
Order Created → Planner creates Production Job
                         ↓
                    POST /api/production/jobs
                         ↓
                    ProductionController
                         ↓
                    ProductionService.create()
                         ↓
                    Generate job_number
                         ↓
                    Link to Order
                         ↓
                    Assign Machine & Operator
                         ↓
                    Save to Database
                         ↓
                    Update Order Status
                         ↓
                    Return Job Object
```

### 4. Inventory Transaction Flow
```
Stock Movement → Create Transaction
                         ↓
                    POST /api/inventory/transactions
                         ↓
                    InventoryController
                         ↓
                    InventoryService.createTransaction()
                         ↓
                    Validate Stock Availability
                         ↓
                    Update Item Stock Level
                         ↓
                    Create Transaction Record
                         ↓
                    Check Reorder Level
                         ↓
                    Trigger Low Stock Alert (if needed)
                         ↓
                    Return Transaction Object
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Layer 1: CORS Protection                                    │
│  ├── Allowed origins configuration                           │
│  └── Credentials support                                     │
│                                                               │
│  Layer 2: JWT Authentication                                 │
│  ├── Access token (1 hour expiry)                            │
│  ├── Refresh token (7 days expiry)                           │
│  └── Token validation on each request                        │
│                                                               │
│  Layer 3: Role-Based Access Control                          │
│  ├── Admin: Full access                                      │
│  ├── Sales: Customer & Order management                      │
│  ├── Planner: Production planning                            │
│  ├── Accounts: Costing & Invoicing                           │
│  └── Inventory: Inventory management                         │
│                                                               │
│  Layer 4: Input Validation                                   │
│  ├── class-validator decorators                              │
│  ├── DTO validation                                          │
│  └── Type checking                                           │
│                                                               │
│  Layer 5: Database Security                                  │
│  ├── Parameterized queries (TypeORM)                         │
│  ├── SQL injection prevention                                │
│  └── Foreign key constraints                                 │
│                                                               │
│  Layer 6: Password Security                                  │
│  ├── bcrypt hashing (10 rounds)                              │
│  ├── No plain text storage                                   │
│  └── Secure password validation                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Module Dependencies

```
┌──────────────┐
│  AppModule   │
└──────┬───────┘
       │
       ├─── ConfigModule (Global)
       │
       ├─── TypeOrmModule (Database)
       │
       ├─── AuthModule
       │    └─── depends on: UsersModule
       │
       ├─── UsersModule
       │
       ├─── CustomersModule
       │    └─── depends on: UsersModule (created_by)
       │
       ├─── OrdersModule
       │    └─── depends on: CustomersModule, UsersModule
       │
       ├─── ProductionModule
       │    └─── depends on: OrdersModule, UsersModule
       │
       ├─── InventoryModule
       │    └─── depends on: UsersModule
       │
       ├─── CostingModule
       │    └─── depends on: ProductionModule, InventoryModule
       │
       └─── DashboardModule
            └─── depends on: OrdersModule, ProductionModule,
                             InventoryModule, CostingModule
```

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Setup                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Load Balancer / Reverse Proxy           │   │
│  │                    (Nginx / Caddy)                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                   │
│         ┌─────────────────┴─────────────────┐               │
│         ▼                                     ▼               │
│  ┌─────────────┐                      ┌─────────────┐       │
│  │  Frontend   │                      │   Backend   │       │
│  │   (Static)  │                      │  (Node.js)  │       │
│  │   Nginx     │                      │   PM2/Docker│       │
│  └─────────────┘                      └──────┬──────┘       │
│                                               │               │
│                                               ▼               │
│                                        ┌─────────────┐       │
│                                        │ PostgreSQL  │       │
│                                        │  (Primary)  │       │
│                                        └─────────────┘       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

**System Architecture Version:** 1.0
**Last Updated:** February 23, 2026
**Status:** Phase 1 MVP Complete
