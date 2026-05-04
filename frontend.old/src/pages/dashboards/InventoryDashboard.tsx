import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export default function InventoryDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: async () => {
      const response = await api.get('/inventory/stats');
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Inventory Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-gray-600 text-sm font-medium">Total Items</div>
          <div className="text-3xl font-bold mt-2">{stats?.total_items || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-gray-600 text-sm font-medium">In Stock</div>
          <div className="text-3xl font-bold mt-2">{stats?.in_stock || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="text-gray-600 text-sm font-medium">Low Stock</div>
          <div className="text-3xl font-bold mt-2">{stats?.low_stock || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="text-gray-600 text-sm font-medium">Out of Stock</div>
          <div className="text-3xl font-bold mt-2">{stats?.out_of_stock || 0}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Stock Levels</h2>
        <p className="text-gray-600">Inventory list will be displayed here</p>
      </div>
    </div>
  );
}
