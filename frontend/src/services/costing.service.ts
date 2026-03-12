import api from './api';

export interface CostingConfig {
  id: string;
  labor_cost_per_hour: number;
  machine_cost_per_hour: number;
  material_waste_percentage: number;
  overhead_percentage: number;
  profit_margin_percentage: number;
  updated_at: string;
}

class CostingService {
  async getConfig(): Promise<CostingConfig> {
    const response = await api.get('/costing/config');
    return response.data;
  }

  async updateConfig(config: Partial<CostingConfig>): Promise<CostingConfig> {
    const response = await api.patch('/costing/config', config);
    return response.data;
  }

  async getJobCosts(jobId: string) {
    const response = await api.get(`/costing/jobs/${jobId}`);
    return response.data;
  }

  async getJobCostSummary(jobId: string) {
    const response = await api.get(`/costing/jobs/${jobId}/summary`);
    return response.data;
  }

  async createJobCost(jobId: string, costData: any) {
    const response = await api.post(`/costing/jobs/${jobId}/costs`, costData);
    return response.data;
  }

  async updateJobCost(costId: string, costData: any) {
    const response = await api.patch(`/costing/costs/${costId}`, costData);
    return response.data;
  }

  async deleteJobCost(costId: string) {
    await api.delete(`/costing/costs/${costId}`);
  }

  async calculateJobCost(jobId: string, costData: any) {
    const response = await api.post('/costing/calculate', { job_id: jobId, ...costData });
    return response.data;
  }

  async saveCalculatedCost(jobId: string, costData: any) {
    const response = await api.post('/costing/calculate/save', { job_id: jobId, ...costData });
    return response.data;
  }
}

export default new CostingService();
