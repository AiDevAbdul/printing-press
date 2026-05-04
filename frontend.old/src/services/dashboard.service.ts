import api from './api';
import { DashboardStats, ProductionJob } from '../types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  async getProductionStatus(): Promise<any> {
    const response = await api.get('/dashboard/production-status');
    return response.data;
  },

  async getPendingDeliveries(): Promise<any> {
    const response = await api.get('/dashboard/pending-deliveries');
    return response.data;
  },

  async getProductionFlow(): Promise<ProductionJob[]> {
    const response = await api.get<{ data: ProductionJob[] }>('/production/jobs', {
      params: { limit: 20, status: 'in_progress,queued' }
    });
    return response.data?.data || [];
  },

  async getRevenueTrend(): Promise<{ date: string; revenue: number }[]> {
    const response = await api.get<{ date: string; revenue: number }[]>('/dashboard/revenue-trend');
    return response.data;
  },
};
