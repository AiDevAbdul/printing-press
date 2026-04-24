import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const tools: Tool[] = [
  // ============ AUTHENTICATION ============
  {
    name: 'login',
    description: 'Authenticate with the Printing Press API using email and password',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'User email address',
        },
        password: {
          type: 'string',
          description: 'User password',
        },
      },
      required: ['email', 'password'],
    },
  },
  {
    name: 'select_company',
    description: 'Select a company for multi-tenant operations (super-admin only)',
    inputSchema: {
      type: 'object',
      properties: {
        company_id: {
          type: 'string',
          description: 'Company ID to select',
        },
      },
      required: ['company_id'],
    },
  },
  {
    name: 'get_profile',
    description: 'Get current user profile information',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ============ ORDERS ============
  {
    name: 'get_orders',
    description: 'Retrieve orders with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by order status (DRAFT, CONFIRMED, IN_PRODUCTION, COMPLETED, CANCELLED)',
        },
        customer_id: {
          type: 'string',
          description: 'Filter by customer ID',
        },
        search: {
          type: 'string',
          description: 'Search by order number or customer name',
        },
        product_type: {
          type: 'string',
          description: 'Filter by product type',
        },
        priority: {
          type: 'string',
          description: 'Filter by priority (LOW, MEDIUM, HIGH, URGENT)',
        },
        page: {
          type: 'number',
          description: 'Page number for pagination (default: 1)',
        },
        limit: {
          type: 'number',
          description: 'Number of results per page (default: 20)',
        },
      },
    },
  },
  {
    name: 'get_order',
    description: 'Get details of a specific order',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Order ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_order',
    description: 'Create a new order',
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'Customer ID',
        },
        product_type: {
          type: 'string',
          description: 'Product type (CARTON, LABEL, POUCH, CPP_CARTON, SILVO_BLISTER, BENT_FOIL, ALU_ALU)',
        },
        quantity: {
          type: 'number',
          description: 'Order quantity',
        },
        priority: {
          type: 'string',
          description: 'Priority level (LOW, MEDIUM, HIGH, URGENT)',
        },
        delivery_date: {
          type: 'string',
          description: 'Expected delivery date (ISO format)',
        },
        notes: {
          type: 'string',
          description: 'Additional notes',
        },
      },
      required: ['customer_id', 'product_type', 'quantity'],
    },
  },
  {
    name: 'update_order',
    description: 'Update an existing order',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Order ID',
        },
        status: {
          type: 'string',
          description: 'New order status',
        },
        priority: {
          type: 'string',
          description: 'New priority level',
        },
        notes: {
          type: 'string',
          description: 'Updated notes',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'update_order_status',
    description: 'Update order status',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Order ID',
        },
        status: {
          type: 'string',
          description: 'New status (DRAFT, CONFIRMED, IN_PRODUCTION, COMPLETED, CANCELLED)',
        },
      },
      required: ['id', 'status'],
    },
  },
  {
    name: 'delete_order',
    description: 'Delete an order (admin/sales only)',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Order ID',
        },
      },
      required: ['id'],
    },
  },

  // ============ QUOTATIONS ============
  {
    name: 'get_quotations',
    description: 'Retrieve quotations with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by quotation status (DRAFT, SENT, APPROVED, REJECTED, CONVERTED)',
        },
        customer_id: {
          type: 'string',
          description: 'Filter by customer ID',
        },
        search: {
          type: 'string',
          description: 'Search by quotation number or customer name',
        },
        from_date: {
          type: 'string',
          description: 'Filter from date (ISO format)',
        },
        to_date: {
          type: 'string',
          description: 'Filter to date (ISO format)',
        },
      },
    },
  },
  {
    name: 'get_quotation',
    description: 'Get details of a specific quotation',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Quotation ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_quotation',
    description: 'Create a new quotation',
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'Customer ID',
        },
        product_type: {
          type: 'string',
          description: 'Product type',
        },
        quantity: {
          type: 'number',
          description: 'Quantity',
        },
        specifications: {
          type: 'object',
          description: 'Product specifications',
        },
        notes: {
          type: 'string',
          description: 'Additional notes',
        },
      },
      required: ['customer_id', 'product_type', 'quantity'],
    },
  },
  {
    name: 'update_quotation',
    description: 'Update an existing quotation',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Quotation ID',
        },
        quantity: {
          type: 'number',
          description: 'Updated quantity',
        },
        notes: {
          type: 'string',
          description: 'Updated notes',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'calculate_pricing',
    description: 'Calculate pricing for a quotation',
    inputSchema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          description: 'Quantity',
        },
        product_type: {
          type: 'string',
          description: 'Product type',
        },
        material_cost: {
          type: 'number',
          description: 'Material cost',
        },
        labor_cost: {
          type: 'number',
          description: 'Labor cost',
        },
        overhead_percentage: {
          type: 'number',
          description: 'Overhead percentage',
        },
        profit_percentage: {
          type: 'number',
          description: 'Profit percentage',
        },
        tax_percentage: {
          type: 'number',
          description: 'Tax percentage',
        },
        fixed_charges: {
          type: 'object',
          description: 'Fixed charges (ctp, spot_uv, plain_uv, etc.)',
        },
      },
      required: ['quantity', 'product_type', 'material_cost'],
    },
  },
  {
    name: 'send_quotation',
    description: 'Send quotation to customer',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Quotation ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'approve_quotation',
    description: 'Approve a quotation',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Quotation ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'reject_quotation',
    description: 'Reject a quotation',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Quotation ID',
        },
        reason: {
          type: 'string',
          description: 'Reason for rejection',
        },
      },
      required: ['id', 'reason'],
    },
  },
  {
    name: 'convert_quotation_to_order',
    description: 'Convert an approved quotation to an order',
    inputSchema: {
      type: 'object',
      properties: {
        quotation_id: {
          type: 'string',
          description: 'Quotation ID to convert',
        },
        delivery_date: {
          type: 'string',
          description: 'Expected delivery date (ISO format)',
        },
        notes: {
          type: 'string',
          description: 'Additional notes for the order',
        },
      },
      required: ['quotation_id'],
    },
  },
  {
    name: 'revise_quotation',
    description: 'Create a revision of a quotation',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Quotation ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_quotation_history',
    description: 'Get revision history of a quotation',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Quotation ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_quotation',
    description: 'Delete a quotation',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Quotation ID',
        },
      },
      required: ['id'],
    },
  },

  // ============ CUSTOMERS ============
  {
    name: 'get_customers',
    description: 'Retrieve all customers',
    inputSchema: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'Search by customer name or email',
        },
        page: {
          type: 'number',
          description: 'Page number for pagination',
        },
        limit: {
          type: 'number',
          description: 'Number of results per page',
        },
      },
    },
  },
  {
    name: 'get_customer',
    description: 'Get details of a specific customer',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Customer ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_customer',
    description: 'Create a new customer',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Customer name',
        },
        email: {
          type: 'string',
          description: 'Customer email',
        },
        phone: {
          type: 'string',
          description: 'Customer phone number',
        },
        address: {
          type: 'string',
          description: 'Customer address',
        },
      },
      required: ['name', 'email'],
    },
  },
  {
    name: 'update_customer',
    description: 'Update customer information',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Customer ID',
        },
        name: {
          type: 'string',
          description: 'Customer name',
        },
        email: {
          type: 'string',
          description: 'Customer email',
        },
        phone: {
          type: 'string',
          description: 'Customer phone number',
        },
        address: {
          type: 'string',
          description: 'Customer address',
        },
      },
      required: ['id'],
    },
  },

  // ============ PRODUCTION ============
  {
    name: 'get_production_orders',
    description: 'Get orders in production workflow',
    inputSchema: {
      type: 'object',
      properties: {
        stage: {
          type: 'string',
          description: 'Filter by production stage',
        },
        status: {
          type: 'string',
          description: 'Filter by status (PENDING, IN_PROGRESS, COMPLETED, ON_HOLD)',
        },
      },
    },
  },
  {
    name: 'update_production_stage',
    description: 'Update production stage for an order',
    inputSchema: {
      type: 'object',
      properties: {
        order_id: {
          type: 'string',
          description: 'Order ID',
        },
        stage_id: {
          type: 'string',
          description: 'Production stage ID',
        },
        status: {
          type: 'string',
          description: 'Stage status (PENDING, IN_PROGRESS, COMPLETED, ON_HOLD)',
        },
        operator_id: {
          type: 'string',
          description: 'Operator ID',
        },
        machine_id: {
          type: 'string',
          description: 'Machine ID',
        },
        notes: {
          type: 'string',
          description: 'Stage notes',
        },
      },
      required: ['order_id', 'stage_id', 'status'],
    },
  },

  // ============ INVENTORY ============
  {
    name: 'get_inventory',
    description: 'Get inventory items',
    inputSchema: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'Search by item name or SKU',
        },
        low_stock: {
          type: 'boolean',
          description: 'Show only low stock items',
        },
      },
    },
  },
  {
    name: 'get_inventory_item',
    description: 'Get details of an inventory item',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Inventory item ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'update_inventory',
    description: 'Update inventory quantity',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Inventory item ID',
        },
        quantity: {
          type: 'number',
          description: 'New quantity',
        },
        notes: {
          type: 'string',
          description: 'Update notes',
        },
      },
      required: ['id', 'quantity'],
    },
  },

  // ============ DASHBOARD ============
  {
    name: 'get_dashboard',
    description: 'Get dashboard summary data',
    inputSchema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          description: 'Dashboard role (admin, sales, prepress, production, quality, dispatch, costing, inventory)',
        },
      },
    },
  },

  // ============ USERS ============
  {
    name: 'get_users',
    description: 'Get all users in company',
    inputSchema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          description: 'Filter by role',
        },
      },
    },
  },
  {
    name: 'get_user',
    description: 'Get user details',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'User ID',
        },
      },
      required: ['id'],
    },
  },
];
