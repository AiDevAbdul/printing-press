const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface WorkflowStage {
  id: number;
  stage_name: string;
  stage_order: number;
  status: string;
  started_at?: string;
  completed_at?: string;
  paused_at?: string;
  active_duration_minutes: number;
  pause_duration_minutes: number;
  total_duration_minutes?: number;
  operator_name?: string;
  machine?: string;
  waste_quantity?: number;
  notes?: string;
  pause_reason?: string;
  qa_approval_required: boolean;
  qa_approval_status?: string;
}

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
  current_stage?: string;
  current_process?: string;
  progress_percent?: number;
  queue_position?: number;
  quality_status?: string;
  created_at: string;
  orders?: {
    id: string;
    order_number: string;
    product_name: string;
    quantity: number;
    unit: string;
    delivery_date: string;
    priority: string;
    customers?: { name: string; company_name?: string };
  };
  users?: { id: string; full_name: string; email: string };
  production_workflow_stages?: WorkflowStage[];
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

  async updateStage(
    jobId: string,
    stageId: number,
    action: 'start' | 'pause' | 'complete' | 'flag',
    extras?: { notes?: string; pause_reason?: string }
  ): Promise<WorkflowStage> {
    const res = await fetch(`${API_BASE}/production/${jobId}/stages/${stageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action, ...extras }),
    });
    if (!res.ok) throw new Error('Failed to update stage');
    return res.json();
  },
};
