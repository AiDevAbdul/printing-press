# MCP Server Quick Reference

Fast lookup guide for common tasks.

## Installation (5 minutes)

```bash
cd mcp-server
npm install
npm run build
cp .env.example .env
# Edit .env with your credentials
```

## Claude Code Setup

Edit `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "printing-press": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "PRINTING_PRESS_API_URL": "http://localhost:3000",
        "PRINTING_PRESS_EMAIL": "admin@printingpress.com",
        "PRINTING_PRESS_PASSWORD": "admin123"
      }
    }
  }
}
```

**Important**: Use absolute path, not relative.

## Common Commands

```bash
npm run build      # Build TypeScript
npm run watch      # Watch mode (auto-rebuild)
npm start          # Run server
npm run dev        # Run in development
```

## Tool Categories

### Orders (6 tools)
```
get_orders(status?, customer_id?, search?, page?, limit?)
get_order(id)
create_order(customer_id, product_type, quantity, priority?, delivery_date?, notes?)
update_order(id, status?, priority?, notes?)
update_order_status(id, status)
delete_order(id)
```

### Quotations (11 tools)
```
get_quotations(status?, customer_id?, search?, from_date?, to_date?)
get_quotation(id)
create_quotation(customer_id, product_type, quantity, specifications?, notes?)
update_quotation(id, quantity?, notes?)
calculate_pricing(quantity, product_type, material_cost, labor_cost, overhead_percentage, profit_percentage, tax_percentage, fixed_charges?)
send_quotation(id)
approve_quotation(id)
reject_quotation(id, reason)
convert_quotation_to_order(quotation_id, delivery_date?, notes?)
revise_quotation(id)
get_quotation_history(id)
delete_quotation(id)
```

### Customers (4 tools)
```
get_customers(search?, page?, limit?)
get_customer(id)
create_customer(name, email, phone?, address?)
update_customer(id, name?, email?, phone?, address?)
```

### Production (2 tools)
```
get_production_orders(stage?, status?)
update_production_stage(order_id, stage_id, status, operator_id?, machine_id?, notes?)
```

### Inventory (3 tools)
```
get_inventory(search?, low_stock?)
get_inventory_item(id)
update_inventory(id, quantity, notes?)
```

### Dashboard (1 tool)
```
get_dashboard(role?)
```

### Users (2 tools)
```
get_users(role?)
get_user(id)
```

### Auth (3 tools)
```
login(email, password)
select_company(company_id)
get_profile()
```

## Common Workflows

### Create & Price Quotation
```
1. create_quotation(customer_id, product_type, quantity)
2. calculate_pricing(quantity, product_type, material_cost, labor_cost, overhead%, profit%, tax%)
3. send_quotation(quotation_id)
```

### Convert to Order
```
1. approve_quotation(quotation_id)
2. convert_quotation_to_order(quotation_id, delivery_date)
```

### Track Production
```
1. get_production_orders(status: "IN_PROGRESS")
2. update_production_stage(order_id, stage_id, status)
```

### Manage Inventory
```
1. get_inventory(low_stock: true)
2. update_inventory(item_id, quantity)
```

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| LOGIN_FAILED | Authentication failed | Check email/password in .env |
| NOT_AUTHENTICATED | No auth token | Run login tool first |
| GET_ORDERS_FAILED | Can't fetch orders | Check backend is running |
| CREATE_ORDER_FAILED | Can't create order | Verify customer_id exists |
| CALCULATE_PRICING_FAILED | Pricing calculation error | Check all required fields |
| SELECT_COMPANY_FAILED | Can't switch company | Verify company_id, check if super-admin |

## Troubleshooting

**Server won't start**
```bash
# Check Node version
node --version  # Should be 18+

# Check for build errors
npm run build 2>&1 | head -20

# Check .env exists
cat .env
```

**Tools not appearing**
```bash
# Rebuild
npm run build

# Restart Claude Code

# Check for errors
npm start  # Should show "running on stdio"
```

**API errors**
```bash
# Test backend
curl http://localhost:3000/auth/me

# Check backend logs
cd ../backend && npm run start:dev
```

**Authentication issues**
```bash
# Test credentials
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@printingpress.com","password":"admin123"}'
```

## File Locations

| File | Purpose |
|------|---------|
| `src/index.ts` | Main server, tool handlers |
| `src/api-client.ts` | HTTP client, API methods |
| `src/tools.ts` | Tool definitions |
| `src/types.ts` | TypeScript interfaces |
| `.env` | Credentials (not committed) |
| `dist/` | Compiled output |

## Environment Variables

```bash
PRINTING_PRESS_API_URL=http://localhost:3000
PRINTING_PRESS_EMAIL=admin@printingpress.com
PRINTING_PRESS_PASSWORD=admin123
```

## Documentation Files

| File | Content |
|------|---------|
| README.md | Overview, tool reference |
| SETUP.md | Installation, configuration |
| INTEGRATION.md | Architecture, patterns |
| WORKFLOWS.md | 10 real-world examples |
| PROJECT_SUMMARY.md | Project overview |
| QUICK_REFERENCE.md | This file |

## Example Queries

```
"Get all orders with status CONFIRMED"
→ Uses: get_orders(status: "CONFIRMED")

"Create a quotation for customer cust-001 for 5000 CARTON units"
→ Uses: create_quotation(customer_id: "cust-001", product_type: "CARTON", quantity: 5000)

"Calculate pricing with material 2500, labor 1000, 15% overhead, 20% profit, 18% tax"
→ Uses: calculate_pricing(material_cost: 2500, labor_cost: 1000, overhead_percentage: 15, profit_percentage: 20, tax_percentage: 18)

"Show me low stock inventory items"
→ Uses: get_inventory(low_stock: true)

"Get dashboard for sales role"
→ Uses: get_dashboard(role: "sales")
```

## Performance Tips

- Use filters to reduce data: `get_orders(status: "CONFIRMED")`
- Paginate large results: `get_orders(limit: 20, page: 1)`
- Search instead of get all: `get_customers(search: "ACME")`
- Batch similar operations together

## Security Checklist

- [ ] .env not committed to git
- [ ] Use absolute path in Claude Code settings
- [ ] Credentials rotated regularly
- [ ] Backend running on localhost (development)
- [ ] HTTPS used in production
- [ ] Service account created for MCP user

## Next Steps

1. Build: `npm run build`
2. Configure: `cp .env.example .env`
3. Add to Claude Code settings
4. Restart Claude Code
5. Test: "Get all orders"
6. Read WORKFLOWS.md for examples

## Support

- **Setup issues**: See SETUP.md
- **Integration help**: See INTEGRATION.md
- **Examples**: See WORKFLOWS.md
- **API reference**: See README.md
- **Project overview**: See PROJECT_SUMMARY.md
