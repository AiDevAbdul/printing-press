'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Factory, Search, AlertCircle, Clock, CheckCircle2, PauseCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { productionService, type ProductionJob } from '@/lib/services/production.service';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'queued', label: 'Queued' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'in_progress') return <Clock className="w-4 h-4 text-blue-500" />;
  if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (status === 'paused') return <PauseCircle className="w-4 h-4 text-yellow-500" />;
  return null;
}

export default function Production() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['production', page, search, status],
    queryFn: () => productionService.getAll({ page, limit: 15, search: search || undefined, status: status || undefined }),
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  const totalPages = data?.pages ?? 1;

  // Summary counts from current page for quick stats
  const inProgressCount = data?.data.filter(j => j.status === 'in_progress').length ?? 0;
  const queuedCount = data?.data.filter(j => j.status === 'queued').length ?? 0;
  const completedCount = data?.data.filter(j => j.status === 'completed').length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Production</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {data ? `${data.total} total jobs` : 'Track production jobs'}
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{isLoading ? '—' : inProgressCount}</p>
              <p className="text-xs text-blue-700">In Progress</p>
            </div>
          </div>
        </Card>
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-400 rounded-xl flex items-center justify-center">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? '—' : queuedCount}</p>
              <p className="text-xs text-gray-600">Queued</p>
            </div>
          </div>
        </Card>
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{isLoading ? '—' : completedCount}</p>
              <p className="text-xs text-green-700">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="elevated" padding="md">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search by job number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            fullWidth
          />
          <div className="sm:w-44 shrink-0">
            <Select
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              fullWidth
            />
          </div>
          <Button type="submit" variant="secondary" className="shrink-0">Search</Button>
        </form>
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
            <EmptyState icon={<AlertCircle />} title="Failed to load jobs" description="Check your connection and try again." />
          </div>
        ) : !data?.data.length ? (
          <div className="p-6">
            <EmptyState
              icon={<Factory />}
              title="No production jobs found"
              description={search || status ? 'Try adjusting your filters.' : 'Jobs are created automatically when orders move to production.'}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-page-bg)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Job #</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Machine</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Operator</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Scheduled Start</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Scheduled End</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Est. Hours</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {data.data.map((job: ProductionJob) => (
                    <tr
                      key={job.id}
                      onClick={() => router.push(`/production/${job.id}`)}
                      className="hover:bg-[var(--color-border-subtle)] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-primary)]">
                        {job.job_number}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-primary)]">
                        {job.assigned_machine || <span className="text-[var(--color-text-tertiary)]">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {job.assigned_operator || <span className="text-[var(--color-text-tertiary)]">—</span>}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{formatDate(job.scheduled_start_date)}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{formatDate(job.scheduled_end_date)}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {job.estimated_hours ? `${job.estimated_hours}h` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <StatusIcon status={job.status} />
                          <Badge variant="status" status={job.status as any} dot>
                            {job.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
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
