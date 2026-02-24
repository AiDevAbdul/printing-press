import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventory.service';
import { InventoryItem, StockTransaction } from '../types';

export const useInventoryItems = (category?: string, search?: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['inventory-items', category, search, page, limit],
    queryFn: () => inventoryService.getAllItems(category, search, page, limit),
  });
};

export const useInventoryItem = (id: string) => {
  return useQuery({
    queryKey: ['inventory-item', id],
    queryFn: () => inventoryService.getItemById(id),
    enabled: !!id,
  });
};

export const useLowStockItems = () => {
  return useQuery({
    queryKey: ['low-stock-items'],
    queryFn: () => inventoryService.getLowStockItems(),
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<InventoryItem>) => inventoryService.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) =>
      inventoryService.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
  });
};

export const useCreateStockTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<StockTransaction>) => inventoryService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['stock-transactions'] });
    },
  });
};

export const useStockTransactions = (itemId?: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['stock-transactions', itemId, page, limit],
    queryFn: () => inventoryService.getAllTransactions(itemId, page, limit),
  });
};
