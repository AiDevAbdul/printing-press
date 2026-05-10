const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface Delivery {
  id: string;
  delivery_number: string;
  delivery_status: string;
  delivery_type: string;
  scheduled_date: string;
  dispatched_at?: string;
  delivered_at?: string;
  tracking_number?: string;
  courier_name?: string;
  delivery_address: string;
  created_at: string;
}

export interface DispatchResponse {
  data: Delivery[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const dispatchService = {
  async getAll(params: { page?: number; limit?: number; status?: string } = {}): Promise<DispatchResponse> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.status) q.set('status', params.status);
    const res = await fetch(`${API_BASE}/dispatch?${q}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch deliveries');
    return res.json();
  },
};
