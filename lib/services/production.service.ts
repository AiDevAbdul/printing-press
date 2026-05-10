const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ProductionJob {
  id: string;
  job_number: string;
  status: string;
  order_id?: string;
  assigned_machine?: string;
  assigned_operator?: string;
  scheduled_start_date?: string;
  scheduled_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  notes?: string;
  created_at: string;
}

export interface ProductionResponse {
  data: ProductionJob[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const productionService = {
  async getAll(params: { page?: number; limit?: number; status?: string; search?: string } = {}): Promise<ProductionResponse> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    const res = await fetch(`${API_BASE}/production?${q}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch production jobs');
    return res.json();
  },

  async getById(id: string): Promise<ProductionJob> {
    const res = await fetch(`${API_BASE}/production/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch production job');
    return res.json();
  },

  async update(id: string, data: Partial<ProductionJob>): Promise<ProductionJob> {
    const res = await fetch(`${API_BASE}/production/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update production job');
    return res.json();
  },
};
