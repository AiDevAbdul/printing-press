'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function fetchApprovals(page: number, status: string) {
  const q = new URLSearchParams({ page: String(page), limit: '15' });
  if (status) q.set('status', status);
  const res = await fetch(`${API_BASE}/approvals?${q}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`${res.status}: Failed to fetch approvals`);
  return res.json();
}

async function submitApproval(data: { design_id: string; status: 'approved' | 'rejected'; comments?: string }) {
  const res = await fetch(`${API_BASE}/approvals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`${res.status}: Failed to submit approval`);
  return res.json();
}

export default function QAApproval() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('pending');
  const [actionId, setActionId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['approvals', page, status],
    queryFn: () => fetchApprovals(page, status),
  });

  const mutation = useMutation({
    mutationFn: submitApproval,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['approvals'] }); setActionId(null); },
  });

  const totalPages = data?.pages ?? 1;

  const pendingCount = data?.data.filter((a: any) => a.status === 'pending').length ?? 0;
  const approvedCount = data?.data.filter((a: any) => a.status === 'approved').length ?? 0;
  const rejectedCount = data?.data.filter((a: any) => a.status === 'rejected').length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">QA Approval</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {data ? `${data.total} approval requests` : 'Review and approve design files'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5 text-white" /></div>
            <div><p className="text-2xl font-bold text-yellow-900">{isLoading ? '—' : pendingCount}</p><p className="text-xs text-yellow-700">Pending Review</p></div>
          </div>
        </Card>
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-white" /></div>
            <div><p className="text-2xl font-bold text-green-900">{isLoading ? '—' : approvedCount}</p><p className="text-xs text-green-700">Approved</p></div>
          </div>
        </Card>
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center"><XCircle className="w-5 h-5 text-white" /></div>
            <div><p className="text-2xl font-bold text-red-900">{isLoading ? '—' : rejectedCount}</p><p className="text-xs text-red-700">Rejected</p></div>
          </div>
        </Card>
      </div>

      <Card variant="elevated" padding="md">
        <div className="flex items-center gap-3">
          <div className="w-52">
            <Select options={STATUS_OPTIONS} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} fullWidth />
          </div>
        </div>
      </Card>

      <Card variant="elevated" padding="none">
        {isLoading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="text" className="h-16" />)}</div>
        ) : error ? (
          <div className="p-6"><EmptyState icon={<AlertCircle />} title="Failed to load approvals" description="Check your connection and try again." /></div>
        ) : !data?.data.length ? (
          <div className="p-6"><EmptyState icon={<ClipboardCheck />} title="No approval requests" description={status ? 'Try a different filter.' : 'Design approvals appear here when submitted.'} /></div>
        ) : (
          <>
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {data.data.map((item: any) => (
                <div key={item.id} className="px-4 py-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-[var(--color-text-primary)]">{item.designs?.name || 'Unnamed Design'}</p>
                      <Badge variant="status" status={item.status as any} dot>{item.status}</Badge>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                      {item.designs?.design_type} · {item.designs?.product_category}
                    </p>
                    {item.comments && (
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1 italic">"{item.comments}"</p>
                    )}
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{formatDate(item.created_at)}</p>
                  </div>
                  {item.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        isLoading={mutation.isPending && actionId === item.id + '_reject'}
                        icon={<XCircle className="w-3.5 h-3.5" />}
                        onClick={() => { setActionId(item.id + '_reject'); mutation.mutate({ design_id: item.design_id, status: 'rejected' }); }}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        isLoading={mutation.isPending && actionId === item.id + '_approve'}
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        onClick={() => { setActionId(item.id + '_approve'); mutation.mutate({ design_id: item.design_id, status: 'approved' }); }}
                      >
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="px-4 py-4 border-t border-[var(--color-border-subtle)]">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={data.total} itemsPerPage={15} />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
