import { useState, useMemo } from 'react';

export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  order: SortOrder;
}

export const useSorting = <T extends Record<string, any>>(
  items: T[],
  defaultSortKey: string = 'created_at'
) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: defaultSortKey,
    order: 'desc',
  });

  const sortedItems = useMemo(() => {
    if (!items || items.length === 0) return items;

    const sorted = [...items].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string') {
        return sortConfig.order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number') {
        return sortConfig.order === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue instanceof Date || typeof aValue === 'string') {
        const dateA = new Date(aValue).getTime();
        const dateB = new Date(bValue).getTime();
        return sortConfig.order === 'asc' ? dateA - dateB : dateB - dateA;
      }

      return 0;
    });

    return sorted;
  }, [items, sortConfig]);

  const toggleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      order: prev.key === key && prev.order === 'desc' ? 'asc' : 'desc',
    }));
  };

  return {
    sortedItems,
    sortConfig,
    toggleSort,
  };
};
