'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ShieldCheck, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { qualityService, type QualityInspection } from '@/lib/services/quality.service';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'conditional', label: 'Conditional' },
];

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ResultIcon({ result }: { result?: string }) {
  if (result === 'passed') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (result === 'failed') return <XCircle className="w-4 h-4 text-red-500" />;
  return <Clock className="w-4 h-4 text-yellow-500" />;
}

export default function Quality() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['quality', page, status],
    queryFn: () => qualityService.getAll({ page, limit: 15, status: status || undefined }),
  });

  const totalPages = data?.pages ?? 1;

  const passedCount = data?.data.filter(i => i.result === 'passed').length ?? 0;
  const failedCount = data?.data.filter(i => i.result === 'failed').length ?? 0;
  const pendingCount = data?.data.filter(i => i.status === 'pending').length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Quality</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {data ? `${data.total} inspections` : 'Quality control and inspections'}
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-900">{isLoading ? '—' : pendingCount}</p>
              <p className="text-xs text-yellow-700">Pending</p>
            </div>
          </div>
        </Card>
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{isLoading ? '—' : passedCount}</p>
              <p className="text-xs text-green-700">Passed</p>
            </div>
          </div>
        </Card>
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-900">{isLoading ? '—' : failedCount}</p>
              <p className="text-xs text-red-700">Failed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card variant="elevated" padding="md">
        <div className="flex items-center gap-3">
          <div className="w-52">
            <Select
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              fullWidth
            />
          </div>
          {status && (
            <Button variant="ghost" size="sm" onClick={() => { setStatus(''); setPage(1); }}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card variant="elevated" padding="none">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="text" className="h-12" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6">
            <EmptyState icon={<AlertCircle />} title="Failed to load inspections" description="Check your connection and try again." />
          </div>
        ) : !data?.data.length ? (
          <div className="p-6">
            <EmptyState
              icon={<ShieldCheck />}
              title="No inspections found"
              description={status ? 'Try a different filter.' : 'Quality inspections appear here as production jobs complete.'}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-page-bg)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Inspection #</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Job ID</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Inspection Date</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Notes</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Result</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {data.data.map((inspection: QualityInspection) => (
                    <tr
                      key={inspection.id}
                      onClick={() => router.push(`/quality/${inspection.id}`)}
                      className="hover:bg-[var(--color-border-subtle)] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-primary)]">
                        {inspection.inspection_number || inspection.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">
                        {inspection.job_id ? inspection.job_id.slice(0, 8) + '…' : '—'}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {formatDate(inspection.inspection_date)}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)] max-w-[200px] truncate">
                        {inspection.notes || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {inspection.result ? (
                          <div className="flex items-center gap-1.5">
                            <ResultIcon result={inspection.result} />
                            <span className="capitalize text-[var(--color-text-primary)]">{inspection.result}</span>
                          </div>
                        ) : (
                          <span className="text-[var(--color-text-tertiary)]">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="status" status={inspection.status as any} dot>
                          {inspection.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-4 border-t border-[var(--color-border-subtle)]">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={data.total}
                  itemsPerPage={15}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
