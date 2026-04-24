# MCP Server Example Workflows

Real-world examples of using the Printing Press MCP Server with Claude.

## 1. Sales Workflow: Create and Price a Quotation

**Goal**: Create a quotation for a customer and calculate pricing.

**Claude Prompt**:
```
Create a quotation for customer "ACME Corp" (customer_id: cust-001) for 5000 units of CARTON product.
Then calculate pricing with:
- Material cost: 2500
- Labor cost: 1000
- Overhead: 15%
- Profit: 20%
- Tax: 18%
- Fixed charges: CTP 500, Spot UV 300
```

**What Claude Does**:
1. Calls `create_quotation` with customer and product details
2. Calls `calculate_pricing` with cost breakdown
3. Returns quotation ID and total price

**Result**:
```json
{
  "quotation_id": "Q-2026-001",
  "subtotal": 4300,
  "overhead": 645,
  "profit": 1193,
  "tax": 1370,
  "total": 7508
}
```

---

## 2. Order Management: Track Production Status

**Goal**: Monitor orders in production and update their status.

**Claude Prompt**:
```
Show me all orders currently in production. For each order, tell me:
- Order number
- Customer name
- Current stage
- Status
- Priority

Then update the first order's status to COMPLETED.
```

**What Claude Does**:
1. Calls `get_production_orders` with status filter
2. Calls `get_order` for each to get full details
3. Calls `update_order_status` to mark as completed

**Result**:
```
Orders in Production:
1. ORD-2026-001 (ACME Corp) - Printing Stage - IN_PROGRESS - HIGH
2. ORD-2026-002 (Tech Inc) - Finishing Stage - PENDING - MEDIUM

✓ Updated ORD-2026-001 to COMPLETED
```

---

## 3. Quotation Lifecycle: From Draft to Order

**Goal**: Complete quotation workflow from creation to order conversion.

**Claude Prompt**:
```
1. Create a quotation for customer cust-002 for 10000 LABEL units
2. Calculate pricing (material: 3000, labor: 1500, overhead: 15%, profit: 25%, tax: 18%)
3. Send the quotation to the customer
4. Approve it
5. Convert it to an order with delivery date 2026-05-15
```

**What Claude Does**:
1. `create_quotation` → quotation_id: Q-2026-002
2. `calculate_pricing` → total: 12,345
3. `send_quotation` → status: SENT
4. `approve_quotation` → status: APPROVED
5. `convert_quotation_to_order` → order_id: ORD-2026-003

**Result**:
```
✓ Quotation Q-2026-002 created
✓ Pricing calculated: $12,345
✓ Quotation sent to customer
✓ Quotation approved
✓ Order ORD-2026-003 created from quotation
```

---

## 4. Customer Management: Add New Customer and Create Order

**Goal**: Onboard a new customer and create their first order.

**Claude Prompt**:
```
Create a new customer:
- Name: "Global Packaging Ltd"
- Email: "sales@globalpackaging.com"
- Phone: "+1-555-0123"
- Address: "123 Industrial Ave, Tech City"

Then create an order for them for 2000 units of POUCH product with HIGH priority.
```

**What Claude Does**:
1. `create_customer` → customer_id: cust-003
2. `create_order` with new customer_id

**Result**:
```
✓ Customer created: cust-003
✓ Order created: ORD-2026-004
  - Customer: Global Packaging Ltd
  - Product: POUCH
  - Quantity: 2000
  - Priority: HIGH
```

---

## 5. Inventory Management: Check Stock and Update

**Goal**: Monitor inventory levels and update stock.

**Claude Prompt**:
```
Show me all low stock inventory items. For each item with less than 100 units:
- Item name
- Current quantity
- Reorder level

Then update the first item's quantity to 500 with note "Restocked".
```

**What Claude Does**:
1. `get_inventory` with low_stock filter
2. `get_inventory_item` for details
3. `update_inventory` to restock

**Result**:
```
Low Stock Items:
1. Paper Roll A4 - 45 units (reorder: 100)
2. Ink Cartridge Black - 12 units (reorder: 50)

✓ Updated Paper Roll A4 to 500 units
```

---

## 6. Dashboard Analytics: Get Business Summary

**Goal**: Retrieve dashboard data for different roles.

**Claude Prompt**:
```
Get dashboard summaries for:
1. Sales role - show pending quotations and recent orders
2. Production role - show orders in production and completion rate
3. Inventory role - show stock levels and reorder alerts
```

**What Claude Does**:
1. `get_dashboard` with role: "sales"
2. `get_dashboard` with role: "production"
3. `get_dashboard` with role: "inventory"

**Result**:
```
Sales Dashboard:
- Pending Quotations: 5
- Orders This Month: 23
- Revenue: $125,000

Production Dashboard:
- Orders in Progress: 8
- Completion Rate: 94%
- Average Lead Time: 3.2 days

Inventory Dashboard:
- Total Items: 156
- Low Stock: 3
- Reorder Alerts: 2
```

---

## 7. Quotation Revision: Handle Customer Changes

**Goal**: Revise a quotation based on customer feedback.

**Claude Prompt**:
```
Get quotation Q-2026-001. The customer wants to increase quantity to 7500 units.
Create a revision with updated pricing:
- Material cost: 3500 (increased)
- Labor cost: 1200
- Same overhead/profit/tax percentages
Then show the revision history.
```

**What Claude Does**:
1. `get_quotation` → Q-2026-001
2. `revise_quotation` → creates new revision
3. `calculate_pricing` with new quantity
4. `get_quotation_history` → shows all versions

**Result**:
```
Original: Q-2026-001 (5000 units) - $7,508
Revision 1: Q-2026-001-R1 (7500 units) - $10,234

History:
- 2026-04-20 10:00 - Original created
- 2026-04-20 14:30 - Revision 1 created (quantity increased)
```

---

## 8. Multi-Company Operations: Super-Admin Workflow

**Goal**: Super-admin switching between companies.

**Claude Prompt**:
```
I'm a super-admin. Show me:
1. My current company
2. Switch to company "BEST FOIL" (company_id: comp-002)
3. Get orders for that company
4. Switch back to "Capital Packages" (company_id: comp-001)
```

**What Claude Does**:
1. `get_profile` → shows current company
2. `select_company` → comp-002
3. `get_orders` → for BEST FOIL
4. `select_company` → comp-001

**Result**:
```
Current Company: Capital Packages (comp-001)

✓ Switched to: BEST FOIL (comp-002)
Orders for BEST FOIL:
- ORD-2026-100: 5000 ALU_ALU units
- ORD-2026-101: 3000 BENT_FOIL units

✓ Switched back to: Capital Packages (comp-001)
```

---

## 9. Search and Filter: Complex Queries

**Goal**: Find specific orders with multiple filters.

**Claude Prompt**:
```
Find all orders that match:
- Status: IN_PRODUCTION
- Priority: HIGH or URGENT
- Product type: CARTON
- Created in last 7 days

Show order number, customer, quantity, and priority.
```

**What Claude Does**:
1. `get_orders` with filters: status, priority, product_type
2. Filters results by date range
3. Formats results

**Result**:
```
High Priority CARTON Orders in Production:
1. ORD-2026-045 (ACME Corp) - 5000 units - URGENT
2. ORD-2026-048 (Tech Inc) - 2500 units - HIGH
3. ORD-2026-051 (Global Pkg) - 8000 units - HIGH
```

---

## 10. Batch Operations: Process Multiple Orders

**Goal**: Update multiple orders at once.

**Claude Prompt**:
```
Get all orders with status CONFIRMED. For each one:
1. Show the order details
2. Update status to IN_PRODUCTION
3. Assign to production team

Show summary of how many were updated.
```

**What Claude Does**:
1. `get_orders` with status: CONFIRMED
2. For each order: `update_order_status` to IN_PRODUCTION
3. Counts and summarizes

**Result**:
```
Processing 12 CONFIRMED orders...

✓ ORD-2026-001 → IN_PRODUCTION
✓ ORD-2026-002 → IN_PRODUCTION
✓ ORD-2026-003 → IN_PRODUCTION
... (9 more)

Summary: 12 orders updated to IN_PRODUCTION
```

---

## Tips for Effective Workflows

1. **Chain Operations**: Use results from one tool as input to the next
2. **Error Handling**: Claude will catch and report API errors
3. **Data Validation**: Claude validates inputs before sending to API
4. **Pagination**: Use page/limit for large result sets
5. **Filtering**: Combine multiple filters for precise queries
6. **Formatting**: Claude formats results for readability

## Common Patterns

### Pattern 1: Get → Update → Verify
```
1. Get current state
2. Make changes
3. Get again to verify
```

### Pattern 2: Create → Configure → Activate
```
1. Create resource
2. Set properties
3. Activate/send
```

### Pattern 3: Search → Filter → Act
```
1. Get all items
2. Filter by criteria
3. Perform action on filtered results
```

### Pattern 4: Multi-Step Workflow
```
1. Create quotation
2. Calculate pricing
3. Send to customer
4. Wait for approval
5. Convert to order
```

## Performance Tips

- Use filters to reduce data transfer
- Paginate large result sets (limit: 20-50)
- Batch similar operations
- Cache frequently accessed data
- Use search instead of getting all items

## Error Recovery

If a tool fails:
1. Claude will show the error code and message
2. Check the error details
3. Verify input parameters
4. Retry with corrected data
5. Check backend logs if needed
