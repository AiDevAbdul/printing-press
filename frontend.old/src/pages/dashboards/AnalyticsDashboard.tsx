import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export default function AnalyticsDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: async () => {
      const response = await api.get('/analytics/stats');
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-gray-600 text-sm font-medium">Total Jobs</div>
          <div className="text-3xl font-bold mt-2">{stats?.total_jobs || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-gray-600 text-sm font-medium">Completed</div>
          <div className="text-3xl font-bold mt-2">{stats?.completed_jobs || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="text-gray-600 text-sm font-medium">Avg Turnaround</div>
          <div className="text-3xl font-bold mt-2">{stats?.avg_turnaround || 0}h</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="text-gray-600 text-sm font-medium">Success Rate</div>
          <div className="text-3xl font-bold mt-2">{stats?.success_rate || 0}%</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
        <p className="text-gray-600">Analytics data will be displayed here</p>
      </div>
    </div>
  );
}
