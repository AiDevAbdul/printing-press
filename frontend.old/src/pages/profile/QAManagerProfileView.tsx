import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import axios from 'axios';

interface QAManagerStats {
  pending_approvals: number;
  total_approvals: number;
  approved_count: number;
  rejected_count: number;
  rejection_rate: number;
  recent_approvals: Array<{
    id: string;
    stage_name: string;
    job_id: string;
    status: 'approved' | 'rejected';
    approved_at: string;
  }>;
}

interface QAManagerProfileViewProps {
  userId: string;
}

export function QAManagerProfileView({ userId }: QAManagerProfileViewProps) {
  const [stats, setStats] = useState<QAManagerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQAStats();
  }, [userId]);

  const fetchQAStats = async () => {
    try {
      setLoading(true);
      // This would be a new endpoint to fetch QA-specific stats
      const response = await axios.get(`/api/users/${userId}/qa-stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load QA stats:', err);
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold">{stats.pending_approvals}</p>
            </div>
            <Clock size={32} className="text-orange-500 opacity-20" />
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold">{stats.approved_count}</p>
            </div>
            <CheckCircle size={32} className="text-green-500 opacity-20" />
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-bold">{stats.rejected_count}</p>
            </div>
            <XCircle size={32} className="text-red-500 opacity-20" />
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rejection Rate</p>
              <p className="text-2xl font-bold">{stats.rejection_rate.toFixed(1)}%</p>
            </div>
            <TrendingUp size={32} className="text-purple-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Recent Approvals */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-bold mb-4">Recent Approvals</h3>
        <div className="space-y-3">
          {stats.recent_approvals.length > 0 ? (
            stats.recent_approvals.map(approval => (
              <div key={approval.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{approval.stage_name}</p>
                  <p className="text-sm text-gray-500">Job {approval.job_id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500">{formatDate(approval.approved_at)}</p>
                  <Badge
                    className={
                      approval.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {approval.status === 'approved' ? 'Approved' : 'Rejected'}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No recent approvals</p>
          )}
        </div>
      </Card>

      {/* Approval Summary */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-bold mb-4">Approval Summary</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Approval Rate</span>
              <span className="text-sm font-bold text-gray-900">
                {((stats.approved_count / stats.total_approvals) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${(stats.approved_count / stats.total_approvals) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Rejection Rate</span>
              <span className="text-sm font-bold text-gray-900">{stats.rejection_rate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${stats.rejection_rate}%` }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
