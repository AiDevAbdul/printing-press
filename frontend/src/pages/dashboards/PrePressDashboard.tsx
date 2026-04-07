import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export default function PrePressDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['prepress-stats'],
    queryFn: async () => {
      const response = await api.get('/prepress/stats');
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Pre-Press Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-gray-600 text-sm font-medium">Designs in Progress</div>
          <div className="text-3xl font-bold mt-2">{stats?.in_design || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="text-gray-600 text-sm font-medium">Waiting for Data</div>
          <div className="text-3xl font-bold mt-2">{stats?.waiting_for_data || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-gray-600 text-sm font-medium">Approved</div>
          <div className="text-3xl font-bold mt-2">{stats?.approved || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="text-gray-600 text-sm font-medium">Rejected</div>
          <div className="text-3xl font-bold mt-2">{stats?.rejected || 0}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Designs</h2>
        <p className="text-gray-600">Design list will be displayed here</p>
      </div>
    </div>
  );
}
