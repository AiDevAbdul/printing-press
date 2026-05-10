'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Factory, Clock, CheckCircle2, PauseCircle, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { dashboardService } from '@/lib/services/dashboard.service';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function fetchActiveJobs() {
  const res = await fetch(`${API_BASE}/production?status=in_progress&limit=10`, { credentials: 'include' });
  if (!res.ok) return { data: [] };
  return res.json();
}

async function fetchQueuedJobs() {
  const res = await fetch(`${API_BASE}/production?status=queued&limit=8`, { credentials: 'include' });
  if (!res.ok) return { data: [] };
  return res.json();
}

function elapsedSince(dateStr?: string) {
  if (!dateStr) return null;
  const ms = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function ProductionDashboard() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardService.getStats });
  const { data: productionStatus, isLoading: statusLoading } = useQuery({ queryKey: ['production-status'], queryFn: dashboardService.getProductionStatus });
  const { data: activeJobs, isLoading: activeLoading } = useQuery({ queryKey: ['active-jobs'], queryFn: fetchActiveJobs });
  const { data: queuedJobs, isLoading: queuedLoading } = useQuery({ queryKey: ['queued-jobs'], queryFn: fetchQueuedJobs });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Production Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Live production status and job queue</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'In Progress', value: statusLoading ? null : productionStatus?.in_progress, icon: <Clock className="w-5 h-5 text-white" />, color: 'from-blue-500 to-blue-600' },
          { label: 'Queued', value: statsLoading ? null : stats?.production_jobs.queued, icon: <Factory className="w-5 h-5 text-white" />, color: 'from-gray-500 to-gray-600' },
          { label: 'Scheduled Today', value: statusLoading ? null : productionStatus?.scheduled_today, icon: <CheckCircle2 className="w-5 h-5 text-white" />, color: 'from-green-500 to-green-600' },
          { label: 'Overdue', value: statusLoading ? null : productionStatus?.overdue, icon: <AlertTriangle className="w-5 h-5 text-white" />, color: 'from-red-500 to-red-600' },
        ].map((card, i) => (
          <Card key={i} variant="elevated" padding="md">
            <div className="flex items-start justify-between gap-2">
              <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shrink-0`}>{card.icon}</div>
              <div className="text-right">
                <p className="text-xs text-[var(--color-text-secondary)]">{card.label}</p>
                {(statsLoading || statusLoading) ? <Skeleton variant="text" className="h-8 w-10 mt-1" /> : (
                  <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">{card.value ?? 0}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" padding="none">
          <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />Active Jobs
            </h2>
            <button onClick={() => router.push('/shop-floor')} className="text-xs text-brand hover:underline">Shop floor →</button>
          </div>
          {activeLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)}</div>
          ) : !(activeJobs?.data?.length) ? (
            <div className="p-5 text-center text-sm text-[var(--color-text-secondary)]">No active jobs</div>
          ) : (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {activeJobs.data.map((job: any) => (
                <div key={job.id} onClick={() => router.push(`/production/${job.id}`)} className="px-4 py-3 flex items-center justify-between hover:bg-[var(--color-border-subtle)] cursor-pointer">
                  <div>
                    <p className="font-mono text-sm font-semibold text-[var(--color-text-primary)]">{job.job_number}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{job.assigned_machine || 'No machine'}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <Badge variant="info" dot>In Progress</Badge>
                    {job.actual_start_date && (
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{elapsedSince(job.actual_start_date)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card variant="elevated" padding="none">
          <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-text-primary)]">Job Queue</h2>
            <button onClick={() => router.push('/planning')} className="text-xs text-brand hover:underline">Planning view →</button>
          </div>
          {queuedLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="text" className="h-10" />)}</div>
          ) : !(queuedJobs?.data?.length) ? (
            <div className="p-5 text-center text-sm text-[var(--color-text-secondary)]">Queue is empty</div>
          ) : (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {queuedJobs.data.map((job: any, idx: number) => (
                <div key={job.id} onClick={() => router.push(`/production/${job.id}`)} className="px-4 py-3 flex items-center justify-between hover:bg-[var(--color-border-subtle)] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--color-text-tertiary)] w-5 text-right shrink-0">#{idx + 1}</span>
                    <div>
                      <p className="font-mono text-sm font-semibold text-[var(--color-text-primary)]">{job.job_number}</p>
                      {job.scheduled_start_date && (
                        <p className="text-xs text-[var(--color-text-tertiary)]">
                          Starts {new Date(job.scheduled_start_date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="default">Queued</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
