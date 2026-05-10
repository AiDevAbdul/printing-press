'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Factory, Search, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusPill } from '@/components/ui/StatusPill';
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

const STAT_CARDS = [
  {
    key: 'in_progress',
    label: 'In Progress',
    icon: Clock,
    colorBg: 'var(--color-info-bg)',
    colorIcon: 'var(--color-info)',
    colorText: 'var(--color-info)',
  },
  {
    key: 'queued',
    label: 'Queued',
    icon: Factory,
    colorBg: 'var(--color-border-subtle)',
    colorIcon: 'var(--color-text-tertiary)',
    colorText: 'var(--color-text-secondary)',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    colorBg: 'var(--color-success-bg)',
    colorIcon: 'var(--color-success)',
    colorText: 'var(--color-success)',
  },
] as const;

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

  const counts = {
    in_progress: data?.data.filter(j => j.status === 'in_progress').length ?? 0,
    queued: data?.data.filter(j => j.status === 'queued').length ?? 0,
    completed: data?.data.filter(j => j.status === 'completed').length ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Production</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          {data ? `${data.total} total jobs` : 'Track and manage production jobs'}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, colorBg, colorIcon, colorText }) => (
          <Card key={key} variant="elevated" padding="md">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: colorBg }}
              >
                <Icon className="w-4.5 h-4.5" style={{ color: colorIcon }} />
              </div>
              <div>
                <p className="text-xl font-bold leading-none" style={{ color: 'var(--color-text-primary)' }}>
                  {isLoading ? '—' : counts[key]}
                </p>
                <p className="text-xs mt-0.5" style={{ color: colorText }}>{label}</p>
              </div>
            </div>
          </Card>
        ))}
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
                  <tr
                    className="border-b"
                    style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-page-bg)' }}
                  >
                    {['Job #', 'Machine', 'Operator', 'Scheduled Start', 'Scheduled End', 'Est. Hours', 'Status'].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ borderColor: 'var(--color-border-subtle)' }}>
                  {data.data.map((job: ProductionJob) => (
                    <tr
                      key={job.id}
                      onClick={() => router.push(`/production/${job.id}`)}
                      className="border-b cursor-pointer transition-colors duration-150"
                      style={{ borderColor: 'var(--color-border-subtle)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-border-subtle)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {job.job_number}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>
                        {job.assigned_machine ?? <span style={{ color: 'var(--color-text-tertiary)' }}>Unassigned</span>}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                        {job.assigned_operator ?? <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{formatDate(job.scheduled_start_date)}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{formatDate(job.scheduled_end_date)}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                        {job.estimated_hours ? `${job.estimated_hours}h` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={job.status as any} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(data?.pages ?? 1) > 1 && (
              <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <Pagination
                  currentPage={page}
                  totalPages={data.pages}
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
