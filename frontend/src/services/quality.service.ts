import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export interface QualityCheckpoint {
  id: string;
  name: string;
  description: string;
  stage: string;
  severity: string;
  checklist_items: string[];
  is_active: boolean;
  sequence_order: number;
}

export interface QualityInspection {
  id: string;
  inspection_number: string;
  job_id: string;
  checkpoint: QualityCheckpoint;
  status: string;
  sample_size: number;
  defects_found: number;
  checklist_results: Record<string, boolean>;
  notes: string;
  failure_reason: string;
  inspector: {
    full_name: string;
  };
  inspected_at: string;
  created_at: string;
  defects: QualityDefect[];
}

export interface QualityDefect {
  id: string;
  category: string;
  severity: string;
  description: string;
  quantity: number;
  photo_url: string;
  root_cause: string;
  corrective_action: string;
  logged_by: {
    full_name: string;
  };
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
  estimated_loss: number;
  corrective_action: string;
  is_resolved: boolean;
  resolved_at: string;
  rejected_by: {
    full_name: string;
  };
  created_at: string;
}

export interface CustomerComplaint {
  id: string;
  complaint_number: string;
  customer: {
    company_name: string;
  };
  job_id: string;
  subject: string;
  description: string;
  status: string;
  severity: string;
  photo_url: string;
  root_cause_analysis: string;
  corrective_action: string;
  preventive_action: string;
  resolution_notes: string;
  resolved_at: string;
  assigned_to: {
    full_name: string;
  };
  created_at: string;
}

export const qualityService = {
  // Checkpoints
  async getCheckpoints(stage?: string): Promise<QualityCheckpoint[]> {
    const params = stage ? { stage } : {};
    const response = await axios.get(`${API_URL}/quality/checkpoints`, {
      headers: getAuthHeader(),
      params,
    });
    return response.data;
  },

  async createCheckpoint(data: any): Promise<QualityCheckpoint> {
    const response = await axios.post(`${API_URL}/quality/checkpoints`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Inspections
  async getInspections(filters?: {
    job_id?: string;
    status?: string;
  }): Promise<{ data: QualityInspection[]; total: number }> {
    const response = await axios.get(`${API_URL}/quality/inspections`, {
      headers: getAuthHeader(),
      params: filters,
    });
    return response.data;
  },

  async getInspection(id: string): Promise<QualityInspection> {
    const response = await axios.get(`${API_URL}/quality/inspections/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async createInspection(data: any): Promise<QualityInspection> {
    const response = await axios.post(`${API_URL}/quality/inspections`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async passInspection(id: string, data: any): Promise<QualityInspection> {
    const response = await axios.post(`${API_URL}/quality/inspections/${id}/pass`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async failInspection(id: string, data: any): Promise<QualityInspection> {
    const response = await axios.post(`${API_URL}/quality/inspections/${id}/fail`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Defects
  async createDefect(data: any, photo?: File): Promise<QualityDefect> {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    if (photo) {
      formData.append('photo', photo);
    }

    const response = await axios.post(`${API_URL}/quality/defects`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getDefects(inspectionId?: string): Promise<QualityDefect[]> {
    const params = inspectionId ? { inspection_id: inspectionId } : {};
    const response = await axios.get(`${API_URL}/quality/defects`, {
      headers: getAuthHeader(),
      params,
    });
    return response.data;
  },

  // Rejections
  async createRejection(data: any): Promise<QualityRejection> {
    const response = await axios.post(`${API_URL}/quality/rejections`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getRejections(jobId?: string): Promise<{ data: QualityRejection[]; total: number }> {
    const params = jobId ? { job_id: jobId } : {};
    const response = await axios.get(`${API_URL}/quality/rejections`, {
      headers: getAuthHeader(),
      params,
    });
    return response.data;
  },

  async updateRejection(id: string, data: any): Promise<QualityRejection> {
    const response = await axios.patch(`${API_URL}/quality/rejections/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Complaints
  async createComplaint(data: any, photo?: File): Promise<CustomerComplaint> {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    if (photo) {
      formData.append('photo', photo);
    }

    const response = await axios.post(`${API_URL}/quality/complaints`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getComplaints(filters?: {
    customer_id?: string;
    status?: string;
  }): Promise<{ data: CustomerComplaint[]; total: number }> {
    const response = await axios.get(`${API_URL}/quality/complaints`, {
      headers: getAuthHeader(),
      params: filters,
    });
    return response.data;
  },

  async getComplaint(id: string): Promise<CustomerComplaint> {
    const response = await axios.get(`${API_URL}/quality/complaints/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async updateComplaint(id: string, data: any): Promise<CustomerComplaint> {
    const response = await axios.patch(`${API_URL}/quality/complaints/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async resolveComplaint(id: string, data: any): Promise<CustomerComplaint> {
    const response = await axios.post(`${API_URL}/quality/complaints/${id}/resolve`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Metrics
  async getMetrics(startDate?: string, endDate?: string): Promise<any> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axios.get(`${API_URL}/quality/metrics`, {
      headers: getAuthHeader(),
      params,
    });
    return response.data;
  },
};
