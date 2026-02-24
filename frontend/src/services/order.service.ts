import api from './api';
import { Order, OrderStatus, PaginatedResponse } from '../types';

export const orderService = {
  async getAll(
    status?: OrderStatus,
    customerId?: string,
    startDate?: string,
    endDate?: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Order>> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (customerId) params.append('customerId', customerId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get<PaginatedResponse<Order>>(`/orders?${params}`);
    return response.data;
  },

  async getById(id: string): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async create(data: Partial<Order>): Promise<Order> {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },

  async update(id: string, data: Partial<Order>): Promise<Order> {
    const response = await api.patch<Order>(`/orders/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const response = await api.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/orders/${id}`);
  },
};
