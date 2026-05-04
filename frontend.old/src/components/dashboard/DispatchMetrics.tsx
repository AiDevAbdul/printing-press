import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface DispatchMetrics {
  total_deliveries: number;
  pending_deliveries: number;
  dispatched_deliveries: number;
  delivered_deliveries: number;
  failed_deliveries: number;
  on_time_delivery_rate: number;
  average_delivery_time_days: number;
}

const DispatchMetrics = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dispatch-metrics'],
    queryFn: async (): Promise<DispatchMetrics> => {
      const response = await axios.get(`${API_URL}/dispatch/metrics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Dispatch Metrics</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Dispatch Metrics</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Total Deliveries</p>
          <p className="text-2xl font-bold text-gray-900">{metrics.total_deliveries}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">On-Time Rate</p>
          <p className="text-2xl font-bold text-green-600">{metrics.on_time_delivery_rate}%</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Pending</span>
          <span className="text-sm font-medium text-yellow-600">{metrics.pending_deliveries}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Dispatched</span>
          <span className="text-sm font-medium text-blue-600">{metrics.dispatched_deliveries}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Delivered</span>
          <span className="text-sm font-medium text-green-600">{metrics.delivered_deliveries}</span>
        </div>
        {metrics.failed_deliveries > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Failed</span>
            <span className="text-sm font-medium text-red-600">{metrics.failed_deliveries}</span>
          </div>
        )}
      </div>

      <div className="pt-4 border-t">
        <p className="text-sm text-gray-600">Avg Delivery Time</p>
        <p className="text-xl font-bold text-gray-900">{metrics.average_delivery_time_days.toFixed(1)} days</p>
      </div>
    </div>
  );
};

export default DispatchMetrics;
