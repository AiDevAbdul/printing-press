import type { DashboardStats } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE}/dashboard?endpoint=stats`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  },

  async getProductionStatus(): Promise<any> {
    const response = await fetch(`${API_BASE}/dashboard?endpoint=production-status`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch production status');
    return response.json();
  },

  async getPendingDeliveries(): Promise<any> {
    const response = await fetch(`${API_BASE}/dashboard?endpoint=pending-deliveries`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch pending deliveries');
    return response.json();
  },

  async getProductionFlow(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/production/jobs?limit=20&status=in_progress,queued`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch production flow');
    const data = await response.json();
    return data?.data || [];
  },

  async getRevenueTrend(): Promise<{ date: string; revenue: number }[]> {
    const response = await fetch(`${API_BASE}/dashboard?endpoint=revenue-trend`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch revenue trend');
    return response.json();
  },
};
