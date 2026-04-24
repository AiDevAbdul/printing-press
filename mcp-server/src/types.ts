export interface AuthToken {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    company_id: string;
    is_super_admin: boolean;
    role: string;
  };
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: string;
  priority: string;
  product_type: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_id: string;
  status: string;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company_id: string;
}

export interface PricingCalculation {
  subtotal: number;
  overhead: number;
  profit: number;
  tax: number;
  total: number;
}

export interface MCPError {
  code: string;
  message: string;
  details?: any;
}
