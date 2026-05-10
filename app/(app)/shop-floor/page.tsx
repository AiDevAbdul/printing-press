'use client';

import { useQuery } from '@tanstack/react-query';
import { Wrench, AlertCircle, Clock, PlayCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function fetchActiveJobs() {
  const res = await fetch(`${API_BASE}/production?status=in_progress&limit=50`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

function formatTime(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });
}

function elapsedSince(dateStr?: string) {
  if (!dateStr) return null;
  const ms = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function ShopFloor() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['shop-floor'],
    queryFn: fetchActiveJobs,
    refetchInterval: 30000,
  });

  const jobs = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Shop Floor</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Live view of active production jobs · auto-refreshes every 30s
          </p>
        </div>
        {!isLoading && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-700">{jobs.length} active</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="card" className="h-40" />)}
        </div>
      ) : error ? (
        <EmptyState icon={<AlertCircle />} title="Failed to load jobs" description="Check your connection and try again." />
      ) : !jobs.length ? (
        <EmptyState icon={<Wrench />} title="No active jobs" description="All production jobs are queued, paused, or completed." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job: any) => {
            const elapsed = elapsedSince(job.actual_start_date);
            return (
              <Card key={job.id} variant="elevated" padding="md" className="border-l-4 border-l-blue-500">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm font-bold text-[var(--color-text-primary)]">{job.job_number}</p>
                      {job.assigned_machine && (
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 flex items-center gap-1">
                          <Wrench className="w-3 h-3" />{job.assigned_machine}
                        </p>
                      )}
                    </div>
                    <Badge variant="status" status="in_progress" dot>In Progress</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[var(--color-page-bg)] rounded-lg p-2">
                      <p className="text-[var(--color-text-tertiary)]">Started</p>
                      <p className="font-medium text-[var(--color-text-primary)] mt-0.5">
                        {formatDate(job.actual_start_date)} {formatTime(job.actual_start_date)}
                      </p>
                    </div>
                    <div className="bg-[var(--color-page-bg)] rounded-lg p-2">
                      <p className="text-[var(--color-text-tertiary)]">Elapsed</p>
                      <p className="font-medium text-[var(--color-text-primary)] mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{elapsed ?? '—'}
                      </p>
                    </div>
                  </div>

                  {job.estimated_hours && (
                    <div>
                      <div className="flex justify-between text-xs text-[var(--color-text-tertiary)] mb-1">
                        <span>Est. {job.estimated_hours}h</span>
                        <span>{elapsed ?? '0m'} elapsed</span>
                      </div>
                      <div className="h-1.5 bg-[var(--color-border-subtle)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 rounded-full"
                          style={{
                            width: `${Math.min(100, job.actual_start_date
                              ? Math.round((Date.now() - new Date(job.actual_start_date).getTime()) / (job.estimated_hours * 3600000) * 100)
                              : 0
                            )}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {job.notes && (
                    <p className="text-xs text-[var(--color-text-tertiary)] italic truncate">"{job.notes}"</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
