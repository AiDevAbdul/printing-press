# Developer Quick Reference Guide

## Printing Press Management System

Quick reference for common development tasks and commands.

---

## 🚀 Quick Start Commands

### First Time Setup
```bash
# Windows
setup.bat

# Linux/Mac
chmod +x setup.sh
./setup.sh
```

### Daily Development

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Database (if using Docker):**
```bash
cd backend
docker compose up
```

---

## 📁 Project Structure Quick Reference

```
printing-press/
├── backend/src/
│   ├── auth/           # JWT authentication
│   ├── users/          # User management
│   ├── customers/      # Customer CRUD
│   ├── orders/         # Order management
│   ├── production/     # Production jobs
│   ├── inventory/      # Stock management
│   ├── costing/        # Job costs & invoices
│   ├── dashboard/      # Statistics
│   ├── migrations/     # Database migrations
│   └── config/         # Configuration
│
└── frontend/src/
    ├── components/     # React components
    ├── pages/          # Page components
    ├── services/       # API services
    ├── hooks/          # Custom hooks
    ├── types/          # TypeScript types
    └── utils/          # Utility functions
```

---

## 🔧 Common Backend Commands

### Development
```bash
npm run start:dev      # Start with hot reload
npm run build          # Build for production
npm run start:prod     # Start production server
```

### Database
```bash
npm run migration:generate -- src/migrations/MigrationName
npm run migration:run
npm run migration:revert
```

### Testing
```bash
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run with coverage
npm run test:e2e       # Run E2E tests
```

---

## 🎨 Common Frontend Commands

### Development
```bash
npm run dev            # Start dev server
npm run build          # Build for production
npm run preview        # Preview production build
```

### Code Quality
```bash
npm run lint           # Run ESLint
npm run format         # Format with Prettier
```

---

## 🔑 Default Credentials

```
Email: admin@printingpress.com
Password: admin123
```

⚠️ **Change after first login!**

---

## 📡 API Endpoints Quick Reference

### Base URL
```
http://localhost:3000/api
```

### Authentication
```bash
# Login
POST /auth/login
Body: { "email": "admin@printingpress.com", "password": "admin123" }

# Get current user
GET /auth/me
Headers: { "Authorization": "Bearer <token>" }

# Refresh token
POST /auth/refresh
Headers: { "Authorization": "Bearer <refresh_token>" }
```

### Customers
```bash
# List customers
GET /customers?page=1&limit=10&search=test

# Create customer
POST /customers
Body: { "name": "John Doe", "email": "john@example.com", ... }

# Get customer
GET /customers/:id

# Update customer
PATCH /customers/:id
Body: { "name": "Jane Doe" }

# Delete customer
DELETE /customers/:id
```

### Orders
```bash
# List orders
GET /orders?status=pending&page=1&limit=10

# Create order
POST /orders
Body: { "customer_id": "uuid", "product_name": "Boxes", ... }

# Update order status
PATCH /orders/:id/status
Body: { "status": "approved" }
```

### Production
```bash
# List jobs
GET /production/jobs?status=in_progress

# Create job
POST /production/jobs
Body: { "order_id": "uuid", "assigned_machine": "Machine 1", ... }

# Start job
POST /production/jobs/:id/start

# Complete job
POST /production/jobs/:id/complete

# Get schedule
GET /production/schedule?startDate=2026-02-01&endDate=2026-02-28
```

### Inventory
```bash
# List items
GET /inventory/items?category=paper

# Get low stock items
GET /inventory/items/low-stock

# Create transaction
POST /inventory/transactions
Body: { "transaction_type": "stock_in", "item_id": "uuid", ... }
```

### Invoices
```bash
# List invoices
GET /invoices?status=draft

# Create invoice
POST /invoices
Body: { "order_id": "uuid", "customer_id": "uuid", ... }

# Record payment
POST /invoices/:id/payment
Body: { "amount": 1000 }
```

### Dashboard
```bash
# Get statistics
GET /dashboard/stats

# Get recent orders
GET /dashboard/recent-orders

# Get production status
GET /dashboard/production-status
```

---

## 🗄️ Database Quick Reference

### Connection
```bash
# Using psql
psql -h localhost -U postgres -d printing_press

# Using Docker
docker exec -it printing_press_db psql -U postgres -d printing_press
```

### Common Queries
```sql
-- List all tables
\dt

-- Describe table
\d users

-- Count records
SELECT COUNT(*) FROM users;

-- View admin user
SELECT * FROM users WHERE role = 'admin';

-- Check order statuses
SELECT status, COUNT(*) FROM orders GROUP BY status;

-- View low stock items
SELECT * FROM inventory_items WHERE current_stock <= reorder_level;
```

---

## 🔐 User Roles & Permissions

| Role      | Permissions                                    |
|-----------|------------------------------------------------|
| Admin     | Full access to all modules                     |
| Sales     | Customers, Orders (create, view, edit)         |
| Planner   | Production (full), Orders (view)               |
| Accounts  | Invoices, Job Costs (full), Orders (view)      |
| Inventory | Inventory (full), Production (view)            |

---

## 📝 Creating New Entities

### Backend Entity
```typescript
// 1. Create entity file
// backend/src/module/entities/entity.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('table_name')
export class EntityName {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // ... more columns
}

// 2. Create DTOs
// backend/src/module/dto/entity.dto.ts
export class CreateEntityDto {
  @IsString()
  name: string;
}

// 3. Create service
// backend/src/module/entity.service.ts
@Injectable()
export class EntityService {
  constructor(
    @InjectRepository(EntityName)
    private repository: Repository<EntityName>,
  ) {}

  async findAll() {
    return this.repository.find();
  }
}

// 4. Create controller
// backend/src/module/entity.controller.ts
@Controller('entities')
export class EntityController {
  constructor(private service: EntityService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}

// 5. Create module
// backend/src/module/entity.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([EntityName])],
  controllers: [EntityController],
  providers: [EntityService],
  exports: [EntityService],
})
export class EntityModule {}

// 6. Import in app.module.ts
imports: [
  // ...
  EntityModule,
]

// 7. Create migration
npm run migration:generate -- src/migrations/CreateEntityTable
npm run build
npm run migration:run
```

### Frontend Service
```typescript
// frontend/src/services/entity.service.ts
import api from './api';
import { Entity } from '../types';

export const entityService = {
  async getAll(): Promise<Entity[]> {
    const response = await api.get<Entity[]>('/entities');
    return response.data;
  },

  async create(data: Partial<Entity>): Promise<Entity> {
    const response = await api.post<Entity>('/entities', data);
    return response.data;
  },
};

// frontend/src/hooks/useEntities.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entityService } from '../services/entity.service';

export const useEntities = () => {
  return useQuery({
    queryKey: ['entities'],
    queryFn: entityService.getAll,
  });
};

export const useCreateEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: entityService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
    },
  });
};
```

---

## 🐛 Debugging Tips

### Backend Debugging
```typescript
// Add console.log in service
console.log('Data:', data);

// Use NestJS Logger
import { Logger } from '@nestjs/common';

private readonly logger = new Logger(ServiceName.name);
this.logger.log('Message');
this.logger.error('Error', trace);
```

### Frontend Debugging
```typescript
// Console log in component
console.log('State:', state);

// React Query DevTools (add to App.tsx)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

### Database Debugging
```bash
# Enable query logging in backend
# src/config/database.config.ts
logging: true,

# Or set in .env
NODE_ENV=development
```

---

## 🔄 Git Workflow

### Initial Setup
```bash
git init
git add .
git commit -m "Initial commit: Phase 1 MVP complete"
git branch -M main
git remote add origin <repository-url>
git push -u origin main
```

### Daily Workflow
```bash
# Start new feature
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: add feature description"

# Push to remote
git push origin feature/feature-name

# Merge to main
git checkout main
git merge feature/feature-name
git push origin main
```

### Commit Message Convention
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

---

## 📦 Environment Variables

### Backend (.env)
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=printing_press

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRATION=7d

# Application
PORT=3000
NODE_ENV=development
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 🚨 Common Issues & Solutions

### Issue: Port already in use
```bash
# Find process using port
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Issue: Database connection failed
```bash
# Check PostgreSQL is running
# Windows
services.msc (look for PostgreSQL)

# Linux
sudo systemctl status postgresql

# Docker
docker ps
docker compose up -d
```

### Issue: Migration failed
```bash
# Revert last migration
npm run migration:revert

# Drop database and recreate
psql -U postgres
DROP DATABASE printing_press;
CREATE DATABASE printing_press;
\q

# Run migrations again
npm run migration:run
```

### Issue: Frontend not connecting to backend
```bash
# Check backend is running
curl http://localhost:3000/api/auth/login

# Check CORS settings in backend
# main.ts should have: app.enableCors()

# Check frontend .env
# VITE_API_BASE_URL should match backend URL
```

---

## 📚 Useful Resources

### Documentation
- NestJS: https://docs.nestjs.com
- TypeORM: https://typeorm.io
- React: https://react.dev
- TanStack Query: https://tanstack.com/query
- Tailwind CSS: https://tailwindcss.com

### Tools
- Postman: API testing
- pgAdmin: PostgreSQL GUI
- VS Code Extensions:
  - ESLint
  - Prettier
  - TypeScript
  - Tailwind CSS IntelliSense

---

## 🎯 Next Development Tasks

### High Priority
1. Implement remaining frontend pages
2. Add form validation (React Hook Form + Zod)
3. Add PDF invoice generation
4. Add unit tests

### Medium Priority
5. Add file upload for artwork
6. Email notifications
7. Advanced search and filters
8. Export to Excel

### Low Priority
9. Performance optimization
10. Advanced analytics
11. Mobile responsive improvements
12. Dark mode

---

## 📞 Getting Help

1. Check documentation files
2. Review error logs
3. Check database connection
4. Verify environment variables
5. Search for similar issues online
6. Create issue in repository

---

**Quick Reference Version:** 1.0
**Last Updated:** February 23, 2026
**Status:** Phase 1 MVP Complete

---

## 💡 Pro Tips

- Use React Query DevTools for debugging API calls
- Enable TypeORM logging during development
- Use Postman collections for API testing
- Keep migrations in version control
- Always test migrations before deploying
- Use environment variables for all secrets
- Commit often with meaningful messages
- Write tests as you develop features
- Document complex business logic
- Keep dependencies up to date

---

**Happy Coding! 🚀**
