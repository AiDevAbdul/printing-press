# Printing Press MCP Server

Model Context Protocol (MCP) server for the Printing Press Management System. Enables Claude and other MCP clients to interact with the Printing Press API with 40+ tools covering orders, quotations, customers, production, inventory, and more.

## Quick Start

```bash
# 1. Build
cd mcp-server
npm install && npm run build

# 2. Configure
cp .env.example .env
# Edit .env with your credentials

# 3. Add to Claude Code settings (~/.claude/settings.json)
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

# 4. Restart Claude Code
```

## Features

- **40+ Tools**: Complete API coverage for all modules
- **Authentication**: Login and multi-company selection (super-admin)
- **Orders**: Create, read, update, delete with filtering
- **Quotations**: Full lifecycle from draft to order conversion
- **Customers**: Create and manage customer information
- **Production**: Track and update production stages
- **Inventory**: Monitor stock levels and updates
- **Dashboard**: Role-based business intelligence
- **Multi-tenant**: Automatic company context management
- **Error Handling**: Detailed error codes and messages

## Documentation

- **[SETUP.md](SETUP.md)** - Complete setup and integration guide
- **[WORKFLOWS.md](WORKFLOWS.md)** - 10+ real-world example workflows
- **[INTEGRATION.md](INTEGRATION.md)** - Integration patterns and architecture

## Available Tools (40+)

### Authentication (3)
- `login` - Authenticate with email and password
- `select_company` - Switch company (super-admin)
- `get_profile` - Get current user profile

### Orders (6)
- `get_orders` - List with filters (status, customer, search, pagination)
- `get_order` - Get specific order
- `create_order` - Create new order
- `update_order` - Update order details
- `update_order_status` - Change order status
- `delete_order` - Delete order

### Quotations (11)
- `get_quotations` - List with filters
- `get_quotation` - Get specific quotation
- `create_quotation` - Create new quotation
- `update_quotation` - Update quotation
- `calculate_pricing` - Calculate pricing with costs and percentages
- `send_quotation` - Send to customer
- `approve_quotation` - Approve quotation
- `reject_quotation` - Reject with reason
- `convert_quotation_to_order` - Convert to order
- `revise_quotation` - Create revision
- `get_quotation_history` - View revision history
- `delete_quotation` - Delete quotation

### Customers (5)
- `get_customers` - List all customers
- `get_customer` - Get specific customer
- `create_customer` - Create new customer
- `update_customer` - Update customer info

### Production (2)
- `get_production_orders` - Get orders in production
- `update_production_stage` - Update stage status

### Inventory (3)
- `get_inventory` - List inventory items
- `get_inventory_item` - Get specific item
- `update_inventory` - Update stock quantity

### Dashboard (1)
- `get_dashboard` - Get role-based summary data

### Users (2)
- `get_users` - List users by role
- `get_user` - Get specific user

## Usage Examples

### Create and Price a Quotation
```
Claude: "Create a quotation for customer cust-001 for 5000 CARTON units,
then calculate pricing with material cost 2500, labor 1000, 15% overhead,
20% profit, and 18% tax"

Result: Quotation Q-2026-001 created with total price $7,508
```

### Track Production Orders
```
Claude: "Show me all orders in production with HIGH priority"

Result: 3 orders found with details and current stage
```

### Convert Quotation to Order
```
Claude: "Convert quotation Q-2026-001 to an order with delivery date 2026-05-15"

Result: Order ORD-2026-001 created from quotation
```

### Manage Inventory
```
Claude: "Show me low stock items and update Paper Roll A4 to 500 units"

Result: 3 low stock items listed, Paper Roll A4 updated
```

## Architecture

```
Claude Code
    ↓
MCP Server (Node.js)
    ├─ tools.ts (40+ tool definitions)
    ├─ index.ts (tool handlers)
    ├─ api-client.ts (HTTP client)
    └─ types.ts (TypeScript interfaces)
    ↓
Printing Press API (NestJS)
    ↓
PostgreSQL Database
```

## Error Handling

All errors include:
- `code` - Error identifier (e.g., `LOGIN_FAILED`, `GET_ORDERS_FAILED`)
- `message` - Human-readable description
- `details` - Additional context from API

Example:
```json
{
  "error": true,
  "code": "GET_ORDERS_FAILED",
  "message": "Unauthorized",
  "details": { "statusCode": 401 }
}
```

## Multi-Tenant Support

- Automatically includes `X-Company-ID` header in all requests
- Super-admin users can switch companies with `select_company`
- Regular users locked to their assigned company
- All data filtered by company at API level

## Development

```bash
# Watch mode (auto-rebuild on changes)
npm run watch

# Build
npm run build

# Run
npm start

# Test locally
npm run dev
```

## Configuration

### Environment Variables

```bash
PRINTING_PRESS_API_URL=http://localhost:3000
PRINTING_PRESS_EMAIL=admin@printingpress.com
PRINTING_PRESS_PASSWORD=admin123
```

### Claude Code Settings

Use absolute paths in `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "printing-press": {
      "command": "node",
      "args": ["/Users/username/projects/printing-press/mcp-server/dist/index.js"],
      "env": {
        "PRINTING_PRESS_API_URL": "http://localhost:3000",
        "PRINTING_PRESS_EMAIL": "admin@printingpress.com",
        "PRINTING_PRESS_PASSWORD": "admin123"
      }
    }
  }
}
```

## Troubleshooting

**Server not connecting?**
- Check absolute path in settings.json
- Verify backend running: `npm run start:dev` in backend/
- Check .env file exists with correct credentials

**Authentication failed?**
- Verify email/password in .env
- Test manually: `curl -X POST http://localhost:3000/auth/login`

**Tools not appearing?**
- Rebuild: `npm run build`
- Restart Claude Code
- Check for build errors: `npm run build 2>&1`

See [SETUP.md](SETUP.md) for detailed troubleshooting.

## Real-World Workflows

See [WORKFLOWS.md](WORKFLOWS.md) for 10+ complete examples:
1. Create and price quotations
2. Track production status
3. Complete quotation lifecycle
4. Onboard customers
5. Manage inventory
6. Get dashboard analytics
7. Handle quotation revisions
8. Multi-company operations
9. Complex search queries
10. Batch operations

## Performance Tips

- Use filters to reduce data transfer
- Paginate large result sets (limit: 20-50)
- Batch similar operations
- Use search instead of getting all items

## Security

- Credentials in `.env` (not committed to git)
- JWT tokens managed by API client
- All requests include company context
- Multi-tenant data isolation at API level

## License

ISC
