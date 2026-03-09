import useSWR from 'swr';
import apiClient from '@/services/api';

// Global SWR fetcher utilizing our Axios instance
export const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

// Custom hook helper for SWR
export function useDataFetch<T>(url: string | null) {
  const { data, error, mutate, isLoading } = useSWR<T>(url, fetcher);

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}
