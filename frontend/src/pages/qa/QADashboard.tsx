import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { ApprovalQueue } from './ApprovalQueue';
import { ApprovalHistory } from './ApprovalHistory';

interface ApprovalStats {
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  total_approvals: number;
}

interface PendingApproval {
  id: string;
  stage_id: string;
  job_id: string;
  job_number: string;
  stage_name: string;
  stage_order: number;
  operator_id: string;
  operator_name: string;
  machine: string;
  created_at: string;
  status: string;
}

export default function QADashboard() {
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['qa-stats'],
    queryFn: async () => {
      const response = await api.get('/api/approvals/stats');
      return response.data as ApprovalStats;
    },
    refetchInterval: 30000,
  });

  const { data: pendingApprovals, isLoading: approvalsLoading } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const response = await api.get('/api/approvals/pending');
      return response.data.approvals as PendingApproval[];
    },
    refetchInterval: 30000,
  });

  const approvalRate = stats && stats.total_approvals > 0
    ? Math.round((stats.approved_count / stats.total_approvals) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QA Approval Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage production stage approvals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending */}
        <Card variant="elevated">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {stats?.pending_count || 0}
                </p>
              )}
            </div>
            <Clock className="w-10 h-10 text-yellow-500 opacity-20" />
          </div>
        </Card>

        {/* Approved */}
        <Card variant="elevated">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats?.approved_count || 0}
                </p>
              )}
            </div>
            <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </Card>

        {/* Rejected */}
        <Card variant="elevated">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats?.rejected_count || 0}
                </p>
              )}
            </div>
            <XCircle className="w-10 h-10 text-red-500 opacity-20" />
          </div>
        </Card>

        {/* Approval Rate */}
        <Card variant="elevated">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approval Rate</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {approvalRate}%
                </p>
              )}
            </div>
            <AlertCircle className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'queue'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Approval Queue ({pendingApprovals?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Approval History
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'queue' && (
          <ApprovalQueue
            approvals={pendingApprovals || []}
            isLoading={approvalsLoading}
          />
        )}
        {activeTab === 'history' && <ApprovalHistory />}
      </div>
    </div>
  );
}
