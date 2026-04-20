# API Conventions

## Response Format

All API responses follow a consistent structure:

### Success Response (200, 201)
```json
{
  "data": { /* entity or array */ },
  "message": "Operation successful",
  "statusCode": 200
}
```

### Error Response (4xx, 5xx)
```json
{
  "message": "Error description",
  "error": "BadRequest|Unauthorized|Forbidden|NotFound|etc",
  "statusCode": 400
}
```

## DTOs (Data Transfer Objects)

### Validation Decorators
```typescript
import { IsString, IsEmail, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  credit_limit?: number;
}
```

### Decorator Order (CRITICAL)
For optional fields, `@IsOptional()` MUST be first:
```typescript
// ✅ CORRECT
@IsOptional()
@IsEnum(ProductType)
product_type?: ProductType;

// ❌ WRONG - will fail validation
@IsEnum(ProductType)
@IsOptional()
product_type?: ProductType;
```

## Field Naming Conventions

- **Database columns**: `snake_case` (e.g., `created_at`, `company_id`)
- **DTOs**: `snake_case` (e.g., `customer_name`, `order_number`)
- **Frontend**: `camelCase` (e.g., `customerName`, `orderNumber`)
- **Enums**: `UPPER_SNAKE_CASE` (e.g., `PENDING`, `IN_PROGRESS`)

## Type Coercion

### String to Number
```typescript
@Transform(({ value }) => Number(value))
@IsNumber()
quantity: number;
```

### String to Boolean
```typescript
@Transform(({ value }) => value === 'true' || value === true)
@IsBoolean()
is_active: boolean;
```

### String to Date
```typescript
@Transform(({ value }) => new Date(value))
@IsDate()
created_at: Date;
```

## Pagination

### Request
```
GET /api/customers?page=1&limit=20&sort=name&order=ASC
```

### Response
```json
{
  "data": [/* items */],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Filtering

### Query Parameters
```
GET /api/orders?status=pending&customer_id=uuid&date_from=2026-01-01&date_to=2026-12-31
```

### Response
Returns filtered results with pagination.

## Sorting

### Query Parameters
```
GET /api/customers?sort=name&order=ASC
GET /api/orders?sort=created_at&order=DESC
```

Valid sort fields depend on entity. Valid orders: `ASC`, `DESC`.

## Authentication

### Headers
```
Authorization: Bearer <access_token>
X-Company-ID: <company_uuid>
```

### Token Refresh
```
POST /api/auth/refresh
Body: { refresh_token: "..." }
Response: { access_token, refresh_token }
```

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check DTO validation, decorator order |
| 401 | Unauthorized | Login again, check token expiry |
| 403 | Forbidden | Check user role, company access |
| 404 | Not Found | Verify ID exists, check company_id |
| 409 | Conflict | Duplicate entry, unique constraint violation |
| 500 | Server Error | Check backend logs |

## Common Issues

### 400 Bad Request on POST
- Check DTO field names match request body
- Verify decorator order (especially `@IsOptional()`)
- Ensure required fields are present
- Check type coercion for numbers/booleans

### 401 Unauthorized
- Token expired → refresh token
- Token missing → check Authorization header
- Invalid token → login again

### 404 Not Found
- ID doesn't exist → verify ID
- Wrong company_id → check X-Company-ID header
- Soft-deleted entity → check is_active flag

### 409 Conflict
- Email already exists → use different email
- Duplicate unique constraint → check existing records
