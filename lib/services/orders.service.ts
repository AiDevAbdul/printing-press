const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface Order {
  id: string;
  order_number: string;
  status: string;
  priority: string;
  product_name: string;
  quantity: number;
  unit: string;
  delivery_date: string;
  order_date: string;
  quoted_price?: number;
  printing_type?: string;
  customers?: { name: string; company_name?: string };
  created_at: string;
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const ordersService = {
  async getAll(params: { page?: number; limit?: number; status?: string; search?: string } = {}): Promise<OrdersResponse> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    const res = await fetch(`${API_BASE}/orders?${q}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getById(id: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  },

  async create(data: Partial<Order>): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  async update(id: string, data: Partial<Order>): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update order');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete order');
  },
};
