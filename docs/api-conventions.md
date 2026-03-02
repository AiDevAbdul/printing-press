# API Conventions

## Response Structure

All list endpoints return:
```typescript
{
  data: T[],
  total: number
}
```

**Frontend handling:**
```typescript
// ❌ DON'T
const items = response || [];

// ✅ DO
const items = response?.data || [];
const total = response?.total || 0;
```

## Type Coercion (Frontend → Backend)

### Numeric Fields
HTML `<input type="number">` returns strings. Always convert:

```typescript
// ❌ DON'T
quantity: formData.quantity  // "100" (string)

// ✅ DO
quantity: Number(formData.quantity)  // 100 (number)
```

### Date Fields
Backend expects ISO date strings:

```typescript
// ❌ DON'T
order_date: formData.order_date  // "2024-03-15" (date input string)

// ✅ DO
order_date: new Date(formData.order_date).toISOString()  // "2024-03-15T00:00:00.000Z"
```

### UUID Fields
Must be valid UUIDs:

```typescript
// ✅ Validated with @IsUUID() decorator
customer_id: "550e8400-e29b-41d4-a716-446655440000"
```

## Field Name Mismatches

### Customers
```typescript
// ❌ DON'T
{ pincode: "123456" }

// ✅ DO
{ postal_code: "123456" }
```

### Orders
```typescript
// Required fields
{
  customer_id: string,      // UUID
  order_date: string,       // ISO date
  delivery_date: string,    // ISO date
  product_name: string,
  quantity: number,
  unit: string
}

// All 30+ specification fields are optional
```

### Invoices
```typescript
// Must extract customer_id from order relationship
{
  order_id: string,
  customer_id: selectedOrder.customer_id || selectedOrder.customer?.id,
  items: [
    {
      description: string,
      quantity: number,
      unit_price: number
    }
  ]
}
```

## DTO Validation

### Required vs Optional
Check DTO decorators:
- `@IsOptional()` - Field is optional
- No decorator or `@IsNotEmpty()` - Field is required

### Nested Objects
Some DTOs require nested arrays:

```typescript
// Invoice creation
{
  order_id: string,
  customer_id: string,
  items: InvoiceItemDto[]  // Array of { description, quantity, unit_price }
}
```

## Enum Values

### Order Status
`pending`, `approved`, `in_production`, `completed`, `delivered`, `cancelled`

### Product Types
`cpp_carton`, `silvo_blister`, `bent_foil`, `alu_alu`

### Varnish Types
`water_base`, `duck`, `plain_uv`, `spot_uv`, `drip_off_uv`, `matt_uv`, `rough_uv`, `none`

### Lamination Types
`shine`, `matt`, `metalize`, `rainbow`, `none`

### Production Stages
`Pre-Press`, `Printing`, `Sorting`, `UV Application`, `Lamination`, `Embossing`, `Die-Cutting`, `Pasting`, `Final QA`

## Date Transformation

Backend uses `@Type(() => Date)` for date fields. Send ISO strings from frontend:

```typescript
// ✅ Backend automatically transforms
order_date: "2024-03-15T00:00:00.000Z"  // → Date object
```
