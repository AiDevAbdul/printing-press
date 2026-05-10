const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  invoice_date: string;
  due_date: string;
  subtotal?: number;
  total_amount: number;
  tax_amount?: number;
  paid_amount: number;
  balance_amount: number;
  description?: string;
  order_id?: string;
  customer_id?: string;
  customers?: { id: string; name: string; company_name?: string; email?: string; phone?: string };
  created_at: string;
  updated_at?: string;
}

export interface InvoicesResponse {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const invoicesService = {
  async getAll(params: { page?: number; limit?: number; status?: string; search?: string } = {}): Promise<InvoicesResponse> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    const res = await fetch(`${API_BASE}/invoices?${q}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch invoices');
    return res.json();
  },

  async getById(id: string): Promise<Invoice> {
    const res = await fetch(`${API_BASE}/invoices/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch invoice');
    return res.json();
  },

  async create(data: Partial<Invoice>): Promise<Invoice> {
    const res = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create invoice');
    return res.json();
  },

  async update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const res = await fetch(`${API_BASE}/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update invoice');
    return res.json();
  },
};
