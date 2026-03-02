import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ProductionJob {
  id: string;
  job_number: string;
  order: {
    id: string;
    order_number: string;
    product_name: string;
    customer: {
      id: string;
      company_name: string;
    };
  };
  status: string;
  current_stage: string;
  current_process: string;
  assigned_machine: string;
  inline_status: string;
  scheduled_start_date: string;
  quantity: number;
}

export interface MaterialConsumption {
  id: string;
  material_name: string;
  material_code: string;
  transaction_type: 'issue' | 'return';
  quantity: number;
  unit: string;
  notes: string;
  created_at: string;
  issued_by: {
    full_name: string;
  };
}

export interface MachineCounter {
  id: string;
  machine_name: string;
  counter_start: number;
  counter_end: number;
  good_quantity: number;
  waste_quantity: number;
  notes: string;
  created_at: string;
}

export interface WastageRecord {
  id: string;
  wastage_type: string;
  quantity: number;
  unit: string;
  estimated_cost: number;
  reason: string;
  corrective_action: string;
  created_at: string;
  recorded_by: {
    full_name: string;
  };
}

export interface StartStageDto {
  job_id: string;
  stage: string;
  process?: string;
  machine?: string;
  counter_start?: number;
  notes?: string;
}

export interface CompleteStageDto {
  stage_history_id: string;
  counter_end?: number;
  good_quantity?: number;
  waste_quantity?: number;
  notes?: string;
  wastage_records?: Array<{
    job_id: string;
    stage_history_id: string;
    wastage_type: string;
    quantity: number;
    unit: string;
    estimated_cost?: number;
    reason?: string;
    corrective_action?: string;
  }>;
}

export interface IssueMaterialDto {
  job_id: string;
  stage_history_id?: string;
  material_name: string;
  material_code?: string;
  quantity: number;
  unit: string;
  notes?: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const shopFloorService = {
  async getMyActiveJobs(): Promise<ProductionJob[]> {
    const response = await axios.get(`${API_URL}/production/shop-floor/my-jobs`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getJobByQRCode(qrCode: string): Promise<ProductionJob> {
    const response = await axios.get(`${API_URL}/production/shop-floor/job-by-qr/${qrCode}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async generateJobQRCode(jobId: string): Promise<string> {
    const response = await axios.get(`${API_URL}/production/shop-floor/job/${jobId}/qr-code`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async startStage(dto: StartStageDto): Promise<ProductionJob> {
    const response = await axios.post(`${API_URL}/production/shop-floor/start-stage`, dto, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async completeStage(dto: CompleteStageDto): Promise<any> {
    const response = await axios.post(`${API_URL}/production/shop-floor/complete-stage`, dto, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async issueMaterial(dto: IssueMaterialDto): Promise<MaterialConsumption> {
    const response = await axios.post(`${API_URL}/production/materials/issue`, dto, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async returnMaterial(dto: IssueMaterialDto): Promise<MaterialConsumption> {
    const response = await axios.post(`${API_URL}/production/materials/return`, dto, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getMaterialConsumption(jobId: string): Promise<MaterialConsumption[]> {
    const response = await axios.get(`${API_URL}/production/materials/${jobId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async recordWastage(dto: any): Promise<WastageRecord> {
    const response = await axios.post(`${API_URL}/production/wastage/record`, dto, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getWastageRecords(jobId: string): Promise<WastageRecord[]> {
    const response = await axios.get(`${API_URL}/production/wastage/${jobId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async syncOfflineActions(actions: any[]): Promise<{ success: number; failed: number }> {
    const response = await axios.post(
      `${API_URL}/production/shop-floor/sync`,
      { actions },
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};
