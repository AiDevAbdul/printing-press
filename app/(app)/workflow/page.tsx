'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { GitBranch, Search, AlertCircle, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function fetchWorkflow(page: number, search: string) {
  const q = new URLSearchParams({ page: String(page), limit: '10' });
  if (search) q.set('search', search);
  const res = await fetch(`${API_BASE}/workflow?${q}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

const STAGE_STATUS_COLOR: Record<string, string> = {
  pending:     'bg-gray-200',
  in_progress: 'bg-blue-400',
  completed:   'bg-green-400',
  skipped:     'bg-gray-100',
  blocked:     'bg-red-400',
};

export default function Workflow() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['workflow', page, search],
    queryFn: () => fetchWorkflow(page, search),
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  const totalPages = Math.ceil((data?.total ?? 0) / 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Workflow</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {data ? `${data.total} production jobs` : 'Track job stage progression'}
          </p>
        </div>
      </div>

      <Card variant="elevated" padding="md">
        <form onSubmit={handleSearch} className="flex gap-3">
          <Input
            placeholder="Search by job number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            fullWidth
          />
          <Button type="submit" variant="secondary" className="shrink-0">Search</Button>
        </form>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="card" className="h-28" />)}
        </div>
      ) : error ? (
        <EmptyState icon={<AlertCircle />} title="Failed to load workflow" description="Check your connection and try again." />
      ) : !data?.data.length ? (
        <EmptyState icon={<GitBranch />} title="No jobs found" description={search ? 'Try a different search.' : 'Production jobs with workflow stages appear here.'} />
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((job: any) => {
              const stages: any[] = job.production_workflow_stages ?? [];
              const completedCount = stages.filter(s => s.status === 'completed').length;
              const progress = stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0;

              return (
                <Card
                  key={job.id}
                  variant="elevated"
                  padding="md"
                  hover
                  onClick={() => router.push(`/production/${job.id}`)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-[var(--color-text-primary)]">{job.job_number}</span>
                        <Badge variant="status" status={job.status as any} dot>{job.status.replace(/_/g, ' ')}</Badge>
                        <span className="text-xs text-[var(--color-text-tertiary)]">{completedCount}/{stages.length} stages</span>
                      </div>

                      {stages.length > 0 ? (
                        <div className="mt-3">
                          <div className="flex items-center gap-1 overflow-x-auto pb-1">
                            {stages.map((stage: any, idx: number) => (
                              <div key={stage.id} className="flex items-center gap-1 shrink-0">
                                <div className="flex flex-col items-center gap-0.5">
                                  <div className={`w-4 h-4 rounded-full ${STAGE_STATUS_COLOR[stage.status] ?? 'bg-gray-200'}`} title={stage.stage_name} />
                                  <span className="text-[10px] text-[var(--color-text-tertiary)] max-w-[48px] truncate text-center leading-tight">
                                    {stage.stage_name}
                                  </span>
                                </div>
                                {idx < stages.length - 1 && <ChevronRight className="w-3 h-3 text-[var(--color-text-tertiary)] shrink-0 mb-3" />}
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 h-1.5 bg-[var(--color-border-subtle)] rounded-full overflow-hidden">
                            <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">No workflow stages configured</p>
                      )}
                    </div>
                    {job.assigned_machine && (
                      <div className="text-right shrink-0">
                        <p className="text-xs text-[var(--color-text-tertiary)]">Machine</p>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{job.assigned_machine}</p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={data.total} itemsPerPage={10} />
          )}
        </>
      )}
    </div>
  );
}
