import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

interface StageApprovalStatusProps {
  stageId: string;
}

interface ApprovalStatus {
  stage_id: string;
  status: 'pending' | 'approved' | 'rejected';
  qa_manager_name?: string;
  rejection_reason?: string;
  approved_at?: string;
  created_at: string;
}

export function StageApprovalStatus({ stageId }: StageApprovalStatusProps) {
  const { data: approvalStatus, isLoading } = useQuery({
    queryKey: ['stage-approval-status', stageId],
    queryFn: async () => {
      const response = await api.get(
        `/api/production/workflow-approval/stage/${stageId}/status`
      );
      return response.data as ApprovalStatus;
    },
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse h-12 bg-gray-200 rounded" />
    );
  }

  if (!approvalStatus) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Card variant="outlined" className="p-3 bg-gray-50">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">QA Approval Status</p>
          <Badge variant={getStatusColor(approvalStatus.status)}>
            {getStatusIcon(approvalStatus.status)}
            <span className="ml-1 capitalize">{approvalStatus.status}</span>
          </Badge>
        </div>

        {approvalStatus.status === 'approved' && (
          <div className="text-xs text-gray-600">
            <p>Approved by: {approvalStatus.qa_manager_name}</p>
            <p>
              Date: {new Date(approvalStatus.approved_at || '').toLocaleDateString()}
            </p>
          </div>
        )}

        {approvalStatus.status === 'rejected' && (
          <div className="p-2 bg-red-50 rounded border border-red-200">
            <p className="text-xs font-medium text-red-900 mb-1">Rejection Reason:</p>
            <p className="text-xs text-red-800">{approvalStatus.rejection_reason}</p>
          </div>
        )}

        {approvalStatus.status === 'pending' && (
          <p className="text-xs text-yellow-700">
            Awaiting QA manager approval...
          </p>
        )}
      </div>
    </Card>
  );
}
