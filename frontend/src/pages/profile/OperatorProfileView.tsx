import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface OperatorStats {
  assigned_stages: number;
  completed_stages: number;
  in_progress_stages: number;
  average_completion_time: number;
  current_active_stages: Array<{
    id: number;
    stage_name: string;
    job_id: string;
    started_at: string;
  }>;
}

interface OperatorProfileViewProps {
  userId: string;
}

export function OperatorProfileView({ userId }: OperatorProfileViewProps) {
  const [stats, setStats] = useState<OperatorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperatorStats();
  }, [userId]);

  const fetchOperatorStats = async () => {
    try {
      setLoading(true);
      // This would be a new endpoint to fetch operator-specific stats
      // For now, we'll show the structure
      const response = await axios.get(`/api/users/${userId}/operator-stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load operator stats:', err);
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Assigned Stages</p>
              <p className="text-2xl font-bold">{stats.assigned_stages}</p>
            </div>
            <AlertCircle size={32} className="text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold">{stats.in_progress_stages}</p>
            </div>
            <Clock size={32} className="text-yellow-500 opacity-20" />
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold">{stats.completed_stages}</p>
            </div>
            <CheckCircle size={32} className="text-green-500 opacity-20" />
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Time</p>
              <p className="text-lg font-bold">{formatDuration(stats.average_completion_time)}</p>
            </div>
            <Clock size={32} className="text-purple-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Current Active Stages */}
      {stats.current_active_stages.length > 0 && (
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-bold mb-4">Currently Active Stages</h3>
          <div className="space-y-3">
            {stats.current_active_stages.map(stage => (
              <div key={stage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{stage.stage_name}</p>
                  <p className="text-sm text-gray-500">Job {stage.job_id}</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
