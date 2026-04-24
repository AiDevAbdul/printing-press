# MCP Server Integration Guide

## What is an MCP Server?

The Model Context Protocol (MCP) is a standard for connecting AI models to external tools and data sources. This MCP server exposes the Printing Press API as tools that Claude and other MCP clients can use.

## Quick Start

### 1. Build the Server

```bash
cd mcp-server
npm install
npm run build
```

### 2. Configure Claude Code

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

### 3. Restart Claude Code

The MCP server will automatically connect and expose all tools.

## What You Can Do

Once connected, Claude can:

- **Query orders** - Search, filter, and retrieve order details
- **Manage quotations** - Create, calculate pricing, convert to orders
- **Access customers** - Look up customer information
- **View dashboards** - Get business intelligence summaries
- **Automate workflows** - Chain multiple API calls together

## Example Workflows

### Generate Sales Report
```
"Show me all orders from the last 30 days with status COMPLETED"
```

### Create and Price a Quotation
```
"Create a quotation for customer ABC with 5000 units of CARTON product,
then calculate pricing with material cost 1000, labor 500, 15% overhead,
20% profit, and 18% tax"
```

### Convert Quotation to Order
```
"Find quotation Q-2026-001, then convert it to an order with delivery
date 2026-05-15"
```

## Troubleshooting

### Server Not Connecting
1. Ensure backend is running: `npm run start:dev` in `backend/`
2. Check API URL in settings matches backend port
3. Verify credentials are correct
4. Check Claude Code logs for connection errors

### Authentication Errors
- Verify email and password in `.env`
- Ensure user has appropriate roles
- Check if super-admin flag is needed for company selection

### API Errors
- Check backend logs for detailed error messages
- Verify company_id is correct for multi-tenant operations
- Ensure user has permission for the requested action

## Architecture

```
Claude Code
    ↓
MCP Server (Node.js)
    ↓
API Client (Axios)
    ↓
Printing Press Backend (NestJS)
    ↓
PostgreSQL Database
```

## Security

- Credentials stored in `.env` (not committed to git)
- JWT tokens managed by API client
- All requests include company context
- Multi-tenant data isolation enforced at API level

## Next Steps

1. Start the backend: `npm run start:dev`
2. Build the MCP server: `npm run build`
3. Configure Claude Code settings
4. Test with simple queries like "get_orders"
5. Build complex workflows using multiple tools
