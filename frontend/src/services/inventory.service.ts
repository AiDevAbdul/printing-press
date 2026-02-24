import api from './api';
import { InventoryItem, StockTransaction, PaginatedResponse } from '../types';

export const inventoryService = {
  async getAllItems(
    category?: string,
    search?: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<InventoryItem>> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get<PaginatedResponse<InventoryItem>>(`/inventory/items?${params}`);
    return response.data;
  },

  async getItemById(id: string): Promise<InventoryItem> {
    const response = await api.get<InventoryItem>(`/inventory/items/${id}`);
    return response.data;
  },

  async createItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await api.post<InventoryItem>('/inventory/items', data);
    return response.data;
  },

  async updateItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await api.patch<InventoryItem>(`/inventory/items/${id}`, data);
    return response.data;
  },

  async deleteItem(id: string): Promise<void> {
    await api.delete(`/inventory/items/${id}`);
  },

  async getLowStockItems(): Promise<InventoryItem[]> {
    const response = await api.get<InventoryItem[]>('/inventory/items/low-stock');
    return response.data;
  },

  async createTransaction(data: Partial<StockTransaction>): Promise<StockTransaction> {
    const response = await api.post<StockTransaction>('/inventory/transactions', data);
    return response.data;
  },

  async getAllTransactions(
    itemId?: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<StockTransaction>> {
    const params = new URLSearchParams();
    if (itemId) params.append('itemId', itemId);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get<PaginatedResponse<StockTransaction>>(`/inventory/transactions?${params}`);
    return response.data;
  },

  async getItemTransactions(itemId: string): Promise<StockTransaction[]> {
    const response = await api.get<StockTransaction[]>(`/inventory/items/${itemId}/transactions`);
    return response.data;
  },
};
