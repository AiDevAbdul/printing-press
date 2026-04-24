import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as dotenv from 'dotenv';
import { PrintingPressAPIClient } from './api-client.js';
import { tools } from './tools.js';

dotenv.config();

const API_URL = process.env.PRINTING_PRESS_API_URL || 'http://localhost:3000';
const DEFAULT_EMAIL = process.env.PRINTING_PRESS_EMAIL || 'admin@printingpress.com';
const DEFAULT_PASSWORD = process.env.PRINTING_PRESS_PASSWORD || 'admin123';

const client = new PrintingPressAPIClient(API_URL);
let isAuthenticated = false;

const server = new Server(
  {
    name: 'printing-press-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Auto-authenticate if needed
    if (!isAuthenticated && name !== 'login') {
      await client.login(DEFAULT_EMAIL, DEFAULT_PASSWORD);
      isAuthenticated = true;
    }

    let result: any;

    switch (name) {
      case 'login': {
        const { email, password } = args as { email: string; password: string };
        result = await client.login(email, password);
        isAuthenticated = true;
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Logged in successfully',
                  user: result.user,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'select_company': {
        const { company_id } = args as { company_id: string };
        result = await client.selectCompany(company_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `Switched to company: ${result.user.company_id}`,
                  user: result.user,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_profile': {
        result = await client.getProfile();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_orders': {
        const filters = args as any;
        result = await client.getOrders(filters);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_order': {
        const { id } = args as { id: string };
        result = await client.getOrder(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_order': {
        result = await client.createOrder(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Order created successfully',
                  order: result,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'update_order': {
        const { id, ...updateData } = args as any;
        result = await client.updateOrder(id, updateData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Order updated successfully',
                  order: result,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'update_order_status': {
        const { id, status } = args as { id: string; status: string };
        result = await client.updateOrderStatus(id, status);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Order status updated successfully',
                  order: result,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'delete_order': {
        const { id } = args as { id: string };
        result = await client.deleteOrder(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Order deleted successfully',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_quotations': {
        const filters = args as any;
        result = await client.getQuotations(filters);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_quotation': {
        const { id } = args as { id: string };
        result = await client.getQuotation(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_quotation': {
        result = await client.createQuotation(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Quotation created successfully',
                  quotation: result,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'update_quotation': {
        const { id, ...updateData } = args as any;
        result = await client.updateQuotation(id, updateData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Quotation updated successfully',
                  quotation: result,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'calculate_pricing': {
        result = await client.calculatePricing(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'send_quotation': {
        const { id } = args as { id: string };
        result = await client.sendQuotation(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Quotation sent successfully',
                  quotation: result,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'approve_quotation': {
        const { id } = args as { id: string };
        result = await client.approveQuotation(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Quotation approved successfully',
                  quotation: result,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'reject_quotation': {
        const { id, reason } = args as { id: string; reason: string };
        result = await client.rejectQuotation(id, reason);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Quotation rejected successfully',
                  quotation: result,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'convert_quotation_to_order': {
        const { quotation_id, ...convertData } = args as any;
        result = await client.convertQuotationToOrder(quotation_id, convertData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Quotation converted to order successfully',
                  order: result,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'revise_quotation': {
        const { id } = args as { id: string };
        result = await client.reviseQuotation(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Quotation revision created successfully',
                  quotation: result,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_quotation_history': {
        const { id } = args as { id: string };
        result = await client.getQuotationHistory(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'delete_quotation': {
        const { id } = args as { id: string };
        result = await client.deleteQuotation(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Quotation deleted successfully',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_customers': {
        const filters = args as any;
        result = await client.getCustomers(filters);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_customer': {
        const { id } = args as { id: string };
        result = await client.getCustomer(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_customer': {
        result = await client.createCustomer(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Customer created successfully',
                  customer: result,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'update_customer': {
        const { id, ...updateData } = args as any;
        result = await client.updateCustomer(id, updateData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Customer updated successfully',
                  customer: result,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_production_orders': {
        const filters = args as any;
        result = await client.getProductionOrders(filters);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_production_stage': {
        result = await client.updateProductionStage(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Production stage updated successfully',
                  stage: result,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_inventory': {
        const filters = args as any;
        result = await client.getInventory(filters);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_inventory_item': {
        const { id } = args as { id: string };
        result = await client.getInventoryItem(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_inventory': {
        const { id, ...updateData } = args as any;
        result = await client.updateInventory(id, updateData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Inventory updated successfully',
                  item: result,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_dashboard': {
        const { role } = args as any;
        result = await client.getDashboard(role);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_users': {
        const filters = args as any;
        result = await client.getUsers(filters);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_user': {
        const { id } = args as { id: string };
        result = await client.getUser(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: true,
              code: error.code || 'UNKNOWN_ERROR',
              message: error.message || 'An error occurred',
              details: error.details,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Printing Press MCP Server running on stdio');
}

main().catch(console.error);
