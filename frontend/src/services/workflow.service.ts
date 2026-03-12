import api from './api';

export interface WorkflowStage {
  id: number;
  stage_name: string;
  stage_order: number;
  status: 'pending' | 'in_progress' | 'paused' | 'completed';
  started_at?: string;
  paused_at?: string;
  resumed_at?: string;
  completed_at?: string;
  active_duration_minutes: number;
  pause_duration_minutes: number;
  total_duration_minutes?: number;
  operator_name?: string;
  operator?: {
    id: string;
    full_name: string;
  };
  machine?: string;
  waste_quantity?: number;
  notes?: string;
  pause_reason?: string;
  can_start: boolean;
  can_pause: boolean;
  can_complete: boolean;
  qa_approval_required?: boolean;
  qa_approval_status?: 'pending' | 'approved' | 'rejected';
  qa_approved_by?: string;
  qa_approved_at?: string;
  qa_rejection_reason?: string;
}

export interface WorkflowResponse {
  job_id: string;
  current_stage: string;
  stages: WorkflowStage[];
}

export interface InitializeWorkflowDto {
  has_pantone?: boolean;
  has_uv_varnish?: boolean;
  has_lamination?: boolean;
  has_emboss?: boolean;
  needs_pasting?: boolean;
}

export interface StartWorkflowStageDto {
  operator_id: string;
  machine?: string;
  notes?: string;
}

export interface PauseWorkflowStageDto {
  reason?: string;
}

export interface CompleteWorkflowStageDto {
  waste_quantity?: number;
  notes?: string;
  quality_approved?: boolean;
}

const workflowService = {
  initializeWorkflow: async (jobId: string, dto: InitializeWorkflowDto) => {
    const response = await api.post(`/production/workflow/${jobId}/initialize`, dto);
    return response.data;
  },

  getWorkflowStages: async (jobId: string): Promise<WorkflowResponse> => {
    const response = await api.get(`/production/workflow/${jobId}`);
    return response.data;
  },

  getWorkflowBatch: async (jobIds: string[]): Promise<{ [jobId: string]: WorkflowResponse }> => {
    const response = await api.get(`/production/workflow/batch`, {
      params: { jobIds: jobIds.join(',') },
    });
    return response.data;
  },

  startStage: async (jobId: string, stageId: number, dto: StartWorkflowStageDto) => {
    const response = await api.post(`/production/workflow/${jobId}/stages/${stageId}/start`, dto);
    return response.data;
  },

  pauseStage: async (jobId: string, stageId: number, dto: PauseWorkflowStageDto) => {
    const response = await api.post(`/production/workflow/${jobId}/stages/${stageId}/pause`, dto);
    return response.data;
  },

  resumeStage: async (jobId: string, stageId: number) => {
    const response = await api.post(`/production/workflow/${jobId}/stages/${stageId}/resume`);
    return response.data;
  },

  completeStage: async (jobId: string, stageId: number, dto: CompleteWorkflowStageDto) => {
    const response = await api.post(`/production/workflow/${jobId}/stages/${stageId}/complete`, dto);
    return response.data;
  },

  // QA Approval endpoints
  getStageApprovalStatus: async (stageId: number) => {
    const response = await api.get(`/approvals/stage/${stageId}`);
    return response.data;
  },

  getJobApprovals: async (jobId: string) => {
    const response = await api.get(`/approvals/job/${jobId}`);
    return response.data;
  },

  approveStage: async (approvalId: string, notes?: string) => {
    const response = await api.post(`/approvals/${approvalId}/approve`, { notes });
    return response.data;
  },

  rejectStage: async (approvalId: string, rejectionReason: string, notes?: string) => {
    const response = await api.post(`/approvals/${approvalId}/reject`, { rejection_reason: rejectionReason, notes });
    return response.data;
  },
};

export default workflowService;
