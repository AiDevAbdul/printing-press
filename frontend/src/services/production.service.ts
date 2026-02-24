import api from './api';
import { ProductionJob, ProductionJobStatus, PaginatedResponse } from '../types';

export const productionService = {
  async getAll(
    status?: ProductionJobStatus,
    machine?: string,
    startDate?: string,
    endDate?: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<ProductionJob>> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (machine) params.append('machine', machine);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get<PaginatedResponse<ProductionJob>>(`/production/jobs?${params}`);
    return response.data;
  },

  async getById(id: string): Promise<ProductionJob> {
    const response = await api.get<ProductionJob>(`/production/jobs/${id}`);
    return response.data;
  },

  async create(data: Partial<ProductionJob>): Promise<ProductionJob> {
    const response = await api.post<ProductionJob>('/production/jobs', data);
    return response.data;
  },

  async update(id: string, data: Partial<ProductionJob>): Promise<ProductionJob> {
    const response = await api.patch<ProductionJob>(`/production/jobs/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, status: ProductionJobStatus): Promise<ProductionJob> {
    const response = await api.patch<ProductionJob>(`/production/jobs/${id}/status`, { status });
    return response.data;
  },

  async startJob(id: string): Promise<ProductionJob> {
    const response = await api.post<ProductionJob>(`/production/jobs/${id}/start`);
    return response.data;
  },

  async completeJob(id: string): Promise<ProductionJob> {
    const response = await api.post<ProductionJob>(`/production/jobs/${id}/complete`);
    return response.data;
  },

  async getSchedule(startDate: string, endDate: string): Promise<ProductionJob[]> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);

    const response = await api.get<ProductionJob[]>(`/production/schedule?${params}`);
    return response.data;
  },
};
