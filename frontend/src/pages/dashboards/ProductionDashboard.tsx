import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export default function ProductionDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['production-stats'],
    queryFn: async () => {
      const response = await api.get('/production/stats');
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Production Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-gray-600 text-sm font-medium">Active Jobs</div>
          <div className="text-3xl font-bold mt-2">{stats?.active_jobs || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="text-gray-600 text-sm font-medium">In Progress</div>
          <div className="text-3xl font-bold mt-2">{stats?.in_progress || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-gray-600 text-sm font-medium">Completed Today</div>
          <div className="text-3xl font-bold mt-2">{stats?.completed_today || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="text-gray-600 text-sm font-medium">Machines Running</div>
          <div className="text-3xl font-bold mt-2">{stats?.machines_running || 0}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Production Queue</h2>
        <p className="text-gray-600">Job queue will be displayed here</p>
      </div>
    </div>
  );
}
