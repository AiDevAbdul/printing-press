import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ApproveDialog } from './ApproveDialog';
import { RejectDialog } from './RejectDialog';
import { toast } from 'sonner';

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

interface ApprovalQueueProps {
  approvals: PendingApproval[];
  isLoading: boolean;
}

export function ApprovalQueue({ approvals, isLoading }: ApprovalQueueProps) {
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async (stageId: string) => {
      await api.post(`/api/production/workflow-approval/stage/${stageId}/approve`);
    },
    onSuccess: () => {
      toast.success('Stage approved successfully');
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['qa-stats'] });
      setApproveDialogOpen(false);
      setSelectedApproval(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve stage');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ stageId, reason }: { stageId: string; reason: string }) => {
      await api.post(`/api/production/workflow-approval/stage/${stageId}/reject`, {
        rejection_reason: reason,
      });
    },
    onSuccess: () => {
      toast.success('Stage rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['qa-stats'] });
      setRejectDialogOpen(false);
      setSelectedApproval(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject stage');
    },
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Card key={i} variant="outlined" className="h-24 animate-pulse bg-gray-100">
            <div />
          </Card>
        ))}
      </div>
    );
  }

  if (!approvals || approvals.length === 0) {
    return (
      <EmptyState
        icon="CheckCircle"
        title="No Pending Approvals"
        description="All stages have been reviewed. Great work!"
      />
    );
  }

  return (
    <div className="space-y-3">
      {approvals.map(approval => (
        <Card key={approval.id} variant="outlined" className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-gray-900">{approval.job_number}</h3>
                <Badge variant="warning">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Stage</p>
                  <p className="font-medium text-gray-900">
                    {approval.stage_name} (#{approval.stage_order})
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Operator</p>
                  <p className="font-medium text-gray-900">{approval.operator_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Machine</p>
                  <p className="font-medium text-gray-900">{approval.machine}</p>
                </div>
                <div>
                  <p className="text-gray-600">Requested</p>
                  <p className="font-medium text-gray-900">{getTimeAgo(approval.created_at)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedApproval(approval);
                  setApproveDialogOpen(true);
                }}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setSelectedApproval(approval);
                  setRejectDialogOpen(true);
                }}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {selectedApproval && (
        <>
          <ApproveDialog
            isOpen={approveDialogOpen}
            onClose={() => {
              setApproveDialogOpen(false);
              setSelectedApproval(null);
            }}
            approval={selectedApproval}
            onConfirm={() => approveMutation.mutate(selectedApproval.stage_id)}
            isLoading={approveMutation.isPending}
          />
          <RejectDialog
            isOpen={rejectDialogOpen}
            onClose={() => {
              setRejectDialogOpen(false);
              setSelectedApproval(null);
            }}
            approval={selectedApproval}
            onConfirm={(reason) =>
              rejectMutation.mutate({
                stageId: selectedApproval.stage_id,
                reason,
              })
            }
            isLoading={rejectMutation.isPending}
          />
        </>
      )}
    </div>
  );
}
