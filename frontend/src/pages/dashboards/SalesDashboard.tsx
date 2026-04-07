import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export default function SalesDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['sales-stats'],
    queryFn: async () => {
      const response = await api.get('/sales/stats');
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Sales Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-gray-600 text-sm font-medium">Total Orders</div>
          <div className="text-3xl font-bold mt-2">{stats?.total_orders || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="text-gray-600 text-sm font-medium">Pending Quotations</div>
          <div className="text-3xl font-bold mt-2">{stats?.pending_quotations || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-gray-600 text-sm font-medium">Active Customers</div>
          <div className="text-3xl font-bold mt-2">{stats?.active_customers || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="text-gray-600 text-sm font-medium">Revenue (This Month)</div>
          <div className="text-3xl font-bold mt-2">${stats?.monthly_revenue || 0}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Order Pipeline</h2>
        <p className="text-gray-600">Order pipeline will be displayed here</p>
      </div>
    </div>
  );
}
