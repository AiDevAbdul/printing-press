const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface Quotation {
  id: string;
  quotation_number: string;
  status: string;
  version: number;
  customer_id: string;
  quotation_date: string;
  valid_until: string;
  product_name: string;
  product_type: string;
  quantity: number;
  unit: string;
  length?: number;
  width?: number;
  height?: number;
  dimension_unit?: string;
  paper_type?: string;
  gsm?: number;
  color_front?: number;
  color_back?: number;
  special_instructions?: string;
  total_amount?: number;
  final_price?: number;
  customers?: { id: string; name: string; company_name?: string; email?: string; phone?: string };
  created_at: string;
  updated_at?: string;
}

export interface QuotationsResponse {
  data: Quotation[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const quotationsService = {
  async getAll(params: { page?: number; limit?: number; status?: string; search?: string } = {}): Promise<QuotationsResponse> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    const res = await fetch(`${API_BASE}/quotations?${q}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch quotations');
    return res.json();
  },

  async getById(id: string): Promise<Quotation> {
    const res = await fetch(`${API_BASE}/quotations/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch quotation');
    return res.json();
  },

  async create(data: Partial<Quotation>): Promise<Quotation> {
    const res = await fetch(`${API_BASE}/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create quotation');
    return res.json();
  },

  async update(id: string, data: Partial<Quotation>): Promise<Quotation> {
    const res = await fetch(`${API_BASE}/quotations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update quotation');
    return res.json();
  },
};
