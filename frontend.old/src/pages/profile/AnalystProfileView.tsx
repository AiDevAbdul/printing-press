import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { BarChart3, Download, Eye } from 'lucide-react';
import api from '../../services/api';

interface AnalystStats {
  reports_accessed: number;
  data_exports: number;
  favorite_dashboards: number;
  last_report_accessed?: string;
  recent_exports: Array<{
    id: string;
    report_name: string;
    exported_at: string;
    format: string;
  }>;
  accessed_dashboards: Array<{
    id: string;
    name: string;
    last_accessed: string;
  }>;
}

interface AnalystProfileViewProps {
  userId: string;
}

export function AnalystProfileView({ userId }: AnalystProfileViewProps) {
  const [stats, setStats] = useState<AnalystStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalystStats();
  }, [userId]);

  const fetchAnalystStats = async () => {
    try {
      setLoading(true);
      // This would be a new endpoint to fetch analyst-specific stats
      const response = await api.get(`/api/users/${userId}/analyst-stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load analyst stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Skeleton variant="card" />;
  }

  if (!stats) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Reports Accessed</p>
              <p className="text-2xl font-bold">{stats.reports_accessed}</p>
            </div>
            <Eye size={32} className="text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Data Exports</p>
              <p className="text-2xl font-bold">{stats.data_exports}</p>
            </div>
            <Download size={32} className="text-green-500 opacity-20" />
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Favorite Dashboards</p>
              <p className="text-2xl font-bold">{stats.favorite_dashboards}</p>
            </div>
            <BarChart3 size={32} className="text-purple-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Recent Exports */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-bold mb-4">Recent Exports</h3>
        <div className="space-y-3">
          {stats.recent_exports.length > 0 ? (
            stats.recent_exports.map(export_item => (
              <div key={export_item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{export_item.report_name}</p>
                  <p className="text-sm text-gray-500">{formatDate(export_item.exported_at)}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">{export_item.format}</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No recent exports</p>
          )}
        </div>
      </Card>

      {/* Accessed Dashboards */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-bold mb-4">Frequently Accessed Dashboards</h3>
        <div className="space-y-3">
          {stats.accessed_dashboards.length > 0 ? (
            stats.accessed_dashboards.map(dashboard => (
              <div key={dashboard.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{dashboard.name}</p>
                  <p className="text-sm text-gray-500">Last accessed: {formatDate(dashboard.last_accessed)}</p>
                </div>
                <BarChart3 size={20} className="text-gray-400" />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No dashboards accessed yet</p>
          )}
        </div>
      </Card>

      {/* Analytics Summary */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-bold mb-4">Analytics Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={20} className="text-blue-600" />
              <p className="font-medium text-blue-900">Data Access</p>
            </div>
            <p className="text-sm text-blue-700">
              You have accessed {stats.reports_accessed} reports and exported data {stats.data_exports} times.
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={20} className="text-purple-600" />
              <p className="font-medium text-purple-900">Dashboard Usage</p>
            </div>
            <p className="text-sm text-purple-700">
              You have {stats.favorite_dashboards} favorite dashboards and regularly access {stats.accessed_dashboards.length} dashboards.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
