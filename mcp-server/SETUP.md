# MCP Server Setup Guide

Complete guide to set up and integrate the Printing Press MCP Server with Claude Code.

## Prerequisites

- Node.js 18+ installed
- Printing Press backend running (`npm run start:dev` on port 3000)
- Claude Code CLI installed

## Step 1: Build the MCP Server

```bash
cd mcp-server
npm install
npm run build
```

Verify the build succeeded:
```bash
ls -la dist/
# Should show: index.js, api-client.js, tools.js, types.js
```

## Step 2: Configure Environment

Create `.env` file in `mcp-server/`:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
PRINTING_PRESS_API_URL=http://localhost:3000
PRINTING_PRESS_EMAIL=admin@printingpress.com
PRINTING_PRESS_PASSWORD=admin123
```

## Step 3: Test the Server Locally

```bash
npm start
```

You should see:
```
Printing Press MCP Server running on stdio
```

Press Ctrl+C to stop.

## Step 4: Configure Claude Code

### Option A: Using settings.json (Recommended)

Find your Claude Code settings file:
- **macOS/Linux**: `~/.claude/settings.json`
- **Windows**: `%USERPROFILE%\.claude\settings.json`

Add the MCP server configuration:

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

**Important**: Use absolute paths, not relative paths.

### Option B: Using Claude Code UI

1. Open Claude Code settings
2. Navigate to MCP Servers section
3. Click "Add Server"
4. Fill in:
   - **Name**: `printing-press`
   - **Command**: `node`
   - **Args**: `/absolute/path/to/mcp-server/dist/index.js`
   - **Environment Variables**:
     - `PRINTING_PRESS_API_URL=http://localhost:3000`
     - `PRINTING_PRESS_EMAIL=admin@printingpress.com`
     - `PRINTING_PRESS_PASSWORD=admin123`

## Step 5: Restart Claude Code

Close and reopen Claude Code to load the MCP server configuration.

## Step 6: Verify Connection

In Claude Code, ask:
```
What tools are available from the printing-press MCP server?
```

You should see a list of all available tools.

## Step 7: Test a Tool

Try a simple query:
```
Get all orders with status CONFIRMED
```

Claude should use the `get_orders` tool and return results.

## Troubleshooting

### Server Not Connecting

**Error**: "MCP server failed to connect"

**Solutions**:
1. Verify absolute path in settings.json
2. Check backend is running: `npm run start:dev` in `backend/`
3. Verify `.env` file exists in `mcp-server/`
4. Check Node.js version: `node --version` (should be 18+)

### Authentication Failed

**Error**: "LOGIN_FAILED" or "NOT_AUTHENTICATED"

**Solutions**:
1. Verify credentials in `.env`:
   ```bash
   cat .env
   ```
2. Test credentials manually:
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@printingpress.com","password":"admin123"}'
   ```
3. Check backend logs for auth errors

### API Connection Failed

**Error**: "ECONNREFUSED" or "Cannot reach API"

**Solutions**:
1. Verify backend is running:
   ```bash
   curl http://localhost:3000/auth/me
   ```
2. Check API URL in `.env` matches backend port
3. If backend on different machine, update `PRINTING_PRESS_API_URL`

### Tools Not Appearing

**Error**: Tools list is empty

**Solutions**:
1. Rebuild the server:
   ```bash
   npm run build
   ```
2. Restart Claude Code
3. Check for build errors:
   ```bash
   npm run build 2>&1 | head -20
   ```

## Development Workflow

### Watch Mode

For development, use watch mode:

```bash
npm run watch
```

This recompiles TypeScript on file changes.

### Testing Tools Manually

Create a test script `test-tools.ts`:

```typescript
import { PrintingPressAPIClient } from './src/api-client.js';

const client = new PrintingPressAPIClient('http://localhost:3000');

async function test() {
  try {
    // Login
    const auth = await client.login('admin@printingpress.com', 'admin123');
    console.log('✓ Logged in:', auth.user.email);

    // Get orders
    const orders = await client.getOrders({ limit: 5 });
    console.log('✓ Got orders:', orders.length);

    // Get customers
    const customers = await client.getCustomers();
    console.log('✓ Got customers:', customers.length);
  } catch (error) {
    console.error('✗ Error:', error);
  }
}

test();
```

Run with:
```bash
npx ts-node test-tools.ts
```

## Production Deployment

### Docker

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

CMD ["node", "dist/index.js"]
```

Build and run:
```bash
docker build -t printing-press-mcp .
docker run -e PRINTING_PRESS_API_URL=http://api:3000 \
           -e PRINTING_PRESS_EMAIL=admin@printingpress.com \
           -e PRINTING_PRESS_PASSWORD=admin123 \
           printing-press-mcp
```

### Environment Variables

For production, use secure environment variable management:

```bash
# Use .env.production
PRINTING_PRESS_API_URL=https://api.printingpress.com
PRINTING_PRESS_EMAIL=service@printingpress.com
PRINTING_PRESS_PASSWORD=${SECURE_PASSWORD}
```

## Security Best Practices

1. **Never commit `.env`** - Add to `.gitignore`
2. **Use service accounts** - Create dedicated MCP user account
3. **Rotate credentials** - Change passwords regularly
4. **Use HTTPS** - In production, use `https://` for API URL
5. **Limit permissions** - Restrict MCP user to necessary roles
6. **Monitor logs** - Check for unauthorized access attempts

## Next Steps

1. ✅ Server is running and connected
2. 📚 Read [README.md](README.md) for tool documentation
3. 🔧 Read [INTEGRATION.md](INTEGRATION.md) for integration patterns
4. 🚀 Start building workflows with Claude

## Support

For issues:
1. Check logs: `npm start` (development mode)
2. Review error messages in Claude Code
3. Test API directly: `curl http://localhost:3000/orders`
4. Check backend logs: `npm run start:dev` output
