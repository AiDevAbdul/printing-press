const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface DesignApproval {
  id: string;
  status: string;
  comments?: string;
  created_at: string;
  users: { id: string; full_name: string };
}

export interface DesignAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  created_at: string;
}

export interface Design {
  id: string;
  name: string;
  design_type: string;
  product_category: string;
  product_name?: string;
  status: string;
  notes?: string;
  specs_sheet_url?: string;
  approval_sheet_url?: string;
  designer_id?: string;
  created_at: string;
  updated_at: string;
  users?: { id: string; full_name: string; email: string };
  design_approvals?: DesignApproval[];
  design_attachments?: DesignAttachment[];
}

export interface PrepressResponse {
  data: Design[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const prepressService = {
  async getAll(params: { page?: number; limit?: number; status?: string; search?: string } = {}): Promise<PrepressResponse> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    const res = await fetch(`${API_BASE}/prepress?${q}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch designs');
    return res.json();
  },

  async getById(id: string): Promise<Design> {
    const res = await fetch(`${API_BASE}/prepress/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch design');
    return res.json();
  },

  async create(data: Partial<Design>): Promise<Design> {
    const res = await fetch(`${API_BASE}/prepress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create design');
    return res.json();
  },

  async update(id: string, data: Partial<Design>): Promise<Design> {
    const res = await fetch(`${API_BASE}/prepress/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update design');
    return res.json();
  },
};
