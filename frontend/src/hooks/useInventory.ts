import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventory.service';
import { InventoryItem, StockTransaction, InventoryFilters } from '../types';

export const useInventoryItems = (filters: InventoryFilters = {}) => {
  return useQuery({
    queryKey: ['inventory', 'items', filters],
    queryFn: () => inventoryService.getAllItems(filters),
  });
};

export const useBrands = (mainCategory?: string) => {
  return useQuery({
    queryKey: ['inventory', 'brands', mainCategory],
    queryFn: () => inventoryService.getBrands(mainCategory),
  });
};

export const useColors = (mainCategory?: string) => {
  return useQuery({
    queryKey: ['inventory', 'colors', mainCategory],
    queryFn: () => inventoryService.getColors(mainCategory),
  });
};

export const useSizes = () => {
  return useQuery({
    queryKey: ['inventory', 'sizes'],
    queryFn: () => inventoryService.getSizes(),
  });
};

export const useGSMValues = () => {
  return useQuery({
    queryKey: ['inventory', 'gsm-values'],
    queryFn: () => inventoryService.getGSMValues(),
  });
};

export const useMaterialTypes = (mainCategory?: string) => {
  return useQuery({
    queryKey: ['inventory', 'material-types', mainCategory],
    queryFn: () => inventoryService.getMaterialTypes(mainCategory),
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
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) =>
      inventoryService.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useCreateStockTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<StockTransaction>) => inventoryService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
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
