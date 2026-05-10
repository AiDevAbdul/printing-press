const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface QualityInspection {
  id: string;
  inspection_number?: string;
  job_id?: string;
  checkpoint_id?: string;
  status: string;
  inspector_id?: string;
  inspected_at?: string;
  notes?: string;
  failure_reason?: string;
  sample_size?: number;
  defects_found?: number;
  checklist_results?: Record<string, unknown>;
  created_at: string;
  quality_defects?: QualityDefect[];
  quality_checkpoints?: QualityCheckpoint;
}

export interface QualityCheckpoint {
  id: string;
  name: string;
  description?: string;
  stage: string;
  severity: string;
  checklist_items?: unknown;
}

export interface QualityDefect {
  id: string;
  inspection_id: string;
  category: string;
  severity: string;
  description: string;
  quantity: number;
  photo_url?: string;
  root_cause?: string;
  corrective_action?: string;
  logged_by_id: string;
  created_at: string;
}

export interface QualityRejection {
  id: string;
  rejection_number: string;
  job_id: string;
  rejected_quantity: number;
  unit: string;
  reason: string;
  disposition: string;
  estimated_loss?: string;
  corrective_action?: string;
  is_resolved: boolean;
  resolved_at?: string;
  rejected_by_id: string;
  created_at: string;
  production_jobs?: { id: string; job_number: string; status: string };
}

export interface QualityResponse {
  data: QualityInspection[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface RejectionResponse {
  data: QualityRejection[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CreateInspectionPayload {
  job_id: string;
  checkpoint_id: string;
  inspection_type: string;
  notes?: string;
}

export interface CreateDefectPayload {
  inspection_id: string;
  category: string;
  severity: string;
  description: string;
  quantity?: number;
  root_cause?: string;
  corrective_action?: string;
}

export interface CreateRejectionPayload {
  job_id: string;
  rejected_quantity: number;
  unit: string;
  reason: string;
  disposition: string;
  estimated_loss?: number;
  corrective_action?: string;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const qualityService = {
  async getAll(params: { page?: number; limit?: number; status?: string } = {}): Promise<QualityResponse> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.status) q.set('status', params.status);
    return apiFetch(`${API_BASE}/quality?${q}`);
  },

  async getOne(id: string): Promise<QualityInspection> {
    return apiFetch(`${API_BASE}/quality/${id}`);
  },

  async create(payload: CreateInspectionPayload): Promise<QualityInspection> {
    return apiFetch(`${API_BASE}/quality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, data: Partial<QualityInspection>): Promise<QualityInspection> {
    return apiFetch(`${API_BASE}/quality/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async getCheckpoints(stage?: string): Promise<QualityCheckpoint[]> {
    const q = stage ? `?stage=${encodeURIComponent(stage)}` : '';
    return apiFetch(`${API_BASE}/quality/checkpoints${q}`);
  },

  defects: {
    async list(inspectionId: string): Promise<QualityDefect[]> {
      return apiFetch(`${API_BASE}/quality/defects?inspection_id=${encodeURIComponent(inspectionId)}`);
    },

    async create(payload: CreateDefectPayload): Promise<QualityDefect> {
      return apiFetch(`${API_BASE}/quality/defects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    },

    async update(id: string, data: Partial<QualityDefect>): Promise<void> {
      return apiFetch(`${API_BASE}/quality/defects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },

    async delete(id: string): Promise<void> {
      return apiFetch(`${API_BASE}/quality/defects/${id}`, { method: 'DELETE' });
    },
  },

  rejections: {
    async list(
      params: { page?: number; limit?: number; job_id?: string; is_resolved?: boolean } = {}
    ): Promise<RejectionResponse> {
      const q = new URLSearchParams();
      if (params.page) q.set('page', String(params.page));
      if (params.limit) q.set('limit', String(params.limit));
      if (params.job_id) q.set('job_id', params.job_id);
      if (params.is_resolved !== undefined) q.set('is_resolved', String(params.is_resolved));
      return apiFetch(`${API_BASE}/quality/rejections?${q}`);
    },

    async create(payload: CreateRejectionPayload): Promise<QualityRejection> {
      return apiFetch(`${API_BASE}/quality/rejections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    },

    async getOne(id: string): Promise<QualityRejection> {
      return apiFetch(`${API_BASE}/quality/rejections/${id}`);
    },

    async update(id: string, data: Partial<QualityRejection>): Promise<QualityRejection> {
      return apiFetch(`${API_BASE}/quality/rejections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },

    async resolve(id: string): Promise<QualityRejection> {
      return apiFetch(`${API_BASE}/quality/rejections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_resolved: true }),
      });
    },
  },
};
