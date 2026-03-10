import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { CheckCircle, XCircle } from 'lucide-react';

interface ApprovalRecord {
  id: string;
  stage_id: string;
  job_id: string;
  job_number: string;
  stage_name: string;
  stage_order: number;
  operator_name: string;
  qa_manager_name: string;
  machine: string;
  status: 'approved' | 'rejected';
  rejection_reason?: string;
  approved_at: string;
  created_at: string;
}

interface HistoryResponse {
  approvals: ApprovalRecord[];
  total: number;
  page: number;
  limit: number;
}

export function ApprovalHistory() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 10;

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['approval-history', page, statusFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });
      const response = await api.get(`/api/approvals/history?${params}`);
      return response.data as HistoryResponse;
    },
    refetchInterval: 60000,
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(dateString).toLocaleDateString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const approvals = historyData?.approvals || [];
  const total = historyData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          type="text"
          placeholder="Search by job number..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as 'all' | 'approved' | 'rejected');
            setPage(1);
          }}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ]}
        />
        <div className="text-sm text-gray-600 flex items-center">
          Total: {total} approvals
        </div>
      </div>

      {/* History List */}
      {approvals.length === 0 ? (
        <EmptyState
          icon="Calendar"
          title="No Approval History"
          description="No approvals match your filters."
        />
      ) : (
        <div className="space-y-3">
          {approvals.map(approval => (
            <Card key={approval.id} variant="outlined" className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{approval.job_number}</h3>
                    <Badge
                      variant={approval.status === 'approved' ? 'success' : 'error'}
                    >
                      {approval.status === 'approved' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Rejected
                        </>
                      )}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-3">
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
                      <p className="text-gray-600">QA Manager</p>
                      <p className="font-medium text-gray-900">{approval.qa_manager_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Machine</p>
                      <p className="font-medium text-gray-900">{approval.machine}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Date</p>
                      <p className="font-medium text-gray-900">{getTimeAgo(approval.approved_at)}</p>
                    </div>
                  </div>

                  {approval.status === 'rejected' && approval.rejection_reason && (
                    <div className="p-3 bg-red-50 rounded border border-red-200">
                      <p className="text-xs font-medium text-red-900 mb-1">Rejection Reason:</p>
                      <p className="text-sm text-red-800">{approval.rejection_reason}</p>
                    </div>
                  )}
                </div>

                <div className="text-right text-xs text-gray-500">
                  <p>{formatDate(approval.approved_at)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
