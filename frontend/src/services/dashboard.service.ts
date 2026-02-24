import api from './api';
import { DashboardStats, Order } from '../types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  async getRecentOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/dashboard/recent-orders');
    return response.data;
  },

  async getProductionStatus(): Promise<any> {
    const response = await api.get('/dashboard/production-status');
    return response.data;
  },

  async getPendingDeliveries(): Promise<Order[]> {
    const response = await api.get<Order[]>('/dashboard/pending-deliveries');
    return response.data;
  },
};
