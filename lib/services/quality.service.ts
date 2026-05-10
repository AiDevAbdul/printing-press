const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface QualityInspection {
  id: string;
  inspection_number?: string;
  job_id?: string;
  status: string;
  result?: string;
  inspector_id?: string;
  inspection_date?: string;
  notes?: string;
  created_at: string;
}

export interface QualityResponse {
  data: QualityInspection[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const qualityService = {
  async getAll(params: { page?: number; limit?: number; status?: string } = {}): Promise<QualityResponse> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.status) q.set('status', params.status);
    const res = await fetch(`${API_BASE}/quality?${q}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch quality inspections');
    return res.json();
  },
};
