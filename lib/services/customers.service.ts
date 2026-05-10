const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface Customer {
  id: string;
  name: string;
  company_name?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  is_active: boolean;
  credit_limit: number;
  credit_days: number;
  customer_group?: string;
  customer_type?: string;
  folder_name?: string;
  ntn?: string;
  strn?: string;
  created_at: string;
}

export interface CustomersResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const customersService = {
  async getAll(params: { page?: number; limit?: number; search?: string; is_active?: boolean } = {}): Promise<CustomersResponse> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.search) q.set('search', params.search);
    if (params.is_active !== undefined) q.set('is_active', String(params.is_active));
    const res = await fetch(`${API_BASE}/customers?${q}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  async getById(id: string): Promise<Customer> {
    const res = await fetch(`${API_BASE}/customers/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch customer');
    return res.json();
  },

  async create(data: Partial<Customer>): Promise<Customer> {
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create customer');
    return res.json();
  },

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    const res = await fetch(`${API_BASE}/customers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update customer');
    return res.json();
  },
};
