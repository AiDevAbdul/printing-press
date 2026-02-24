import api from './api';
import { Invoice, InvoiceStatus, InvoiceItem, JobCost, PaginatedResponse } from '../types';

export const invoiceService = {
  async getAll(
    status?: InvoiceStatus,
    customerId?: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Invoice>> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (customerId) params.append('customerId', customerId);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get<PaginatedResponse<Invoice>>(`/invoices?${params}`);
    return response.data;
  },

  async getById(id: string): Promise<Invoice> {
    const response = await api.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },

  async create(data: Partial<Invoice>): Promise<Invoice> {
    const response = await api.post<Invoice>('/invoices', data);
    return response.data;
  },

  async update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const response = await api.patch<Invoice>(`/invoices/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/invoices/${id}`);
  },

  async recordPayment(id: string, amount: number, notes?: string): Promise<Invoice> {
    const response = await api.post<Invoice>(`/invoices/${id}/payment`, { amount, notes });
    return response.data;
  },

  async getInvoiceItems(id: string): Promise<InvoiceItem[]> {
    const response = await api.get<InvoiceItem[]>(`/invoices/${id}/items`);
    return response.data;
  },

  async getJobCosts(jobId: string): Promise<JobCost[]> {
    const response = await api.get<JobCost[]>(`/costing/jobs/${jobId}`);
    return response.data;
  },

  async getJobCostSummary(jobId: string): Promise<any> {
    const response = await api.get(`/costing/jobs/${jobId}/summary`);
    return response.data;
  },

  async createJobCost(data: Partial<JobCost>): Promise<JobCost> {
    const response = await api.post<JobCost>(`/costing/jobs/${data.job_id}/costs`, data);
    return response.data;
  },

  async updateJobCost(id: string, data: Partial<JobCost>): Promise<JobCost> {
    const response = await api.patch<JobCost>(`/costing/costs/${id}`, data);
    return response.data;
  },

  async deleteJobCost(id: string): Promise<void> {
    await api.delete(`/costing/costs/${id}`);
  },
};
