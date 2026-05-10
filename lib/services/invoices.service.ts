const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  customers?: { name: string; company_name?: string };
  created_at: string;
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
};
