# System Architecture Diagram

## Printing Press Management System - Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + Vite)                        │
│                         http://localhost:5173                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │    Login     │  │  Dashboard   │  │  Customers   │  │   Orders    │ │
│  │     Page     │  │     Page     │  │     Page     │  │    Page     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Production   │  │  Inventory   │  │   Invoices   │  │   Layout    │ │
│  │     Page     │  │     Page     │  │     Page     │  │  Component  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      React Router v6                               │  │
│  │              (Protected Routes + Authentication)                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                   TanStack Query (React Query)                     │  │
│  │              (Server State Management + Caching)                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                        API Services Layer                          │  │
│  │   auth.service | customer.service | order.service | etc.          │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Axios HTTP Client                               │  │
│  │         (JWT Interceptors + Token Refresh)                         │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/REST API
                                    │ JWT Authentication
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (NestJS + TypeORM)                        │
│                         http://localhost:3000/api                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      API Gateway Layer                             │  │
│  │              (CORS, Validation, Error Handling)                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Authentication Middleware                       │  │
│  │         (JWT Strategy, Guards, Role-Based Access Control)          │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        MODULES                                    │   │
│  │                                                                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │   │
│  │  │    Auth     │  │    Users    │  │  Customers  │             │   │
│  │  │   Module    │  │   Module    │  │   Module    │             │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │   │
│  │                                                                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │   │
│  │  │   Orders    │  │ Production  │  │  Inventory  │             │   │
│  │  │   Module    │  │   Module    │  │   Module    │             │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │   │
│  │                                                                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │   │
│  │  │   Costing   │  │  Dashboard  │  │   Common    │             │   │
│  │  │   Module    │  │   Module    │  │   Module    │             │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  Each Module Contains:                                                   │
│  ├── Controller (HTTP endpoints)                                         │
│  ├── Service (Business logic)                                            │
│  ├── Entity (Database model)                                             │
│  └── DTOs (Data validation)                                              │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                         TypeORM Layer                              │  │
│  │              (ORM, Query Builder, Migrations)                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SQL Queries
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL 15)                            │
│                         localhost:5432                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │    users     │  │  customers   │  │    orders    │  │ production_ │ │
│  │    table     │  │    table     │  │    table     │  │ jobs table  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ inventory_   │  │    stock_    │  │  job_costs   │  │  invoices   │ │
│  │ items table  │  │transactions  │  │    table     │  │    table    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                                           │
│  ┌──────────────┐                                                        │
│  │ invoice_     │                                                        │
│  │ items table  │                                                        │
│  └──────────────┘                                                        │
│                                                                           │
│  Features:                                                                │
│  ├── Foreign Key Constraints                                             │
│  ├── Indexes for Performance                                             │
│  ├── UUID Primary Keys                                                   │
│  └── Enum Types for Status Fields                                        │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

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
