'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Factory, Clock, CalendarCheck, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { Skeleton } from '@/components/ui/Skeleton';
import { dashboardService } from '@/lib/services/dashboard.service';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

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

function jobStatusPill(status?: string) {
  switch (status) {
    case 'in_progress': return <StatusPill status="in_progress" label="In Progress" />;
    case 'queued':      return <StatusPill status="queued" label="Queued" />;
    case 'completed':   return <StatusPill status="completed" label="Done" />;
    case 'paused':      return <StatusPill status="paused" label="Paused" />;
    default:            return <StatusPill status="queued" />;
  }
}

export default function ProductionDashboard() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardService.getStats });
  const { data: productionStatus, isLoading: statusLoading } = useQuery({ queryKey: ['production-status'], queryFn: dashboardService.getProductionStatus });
  const { data: activeJobs, isLoading: activeLoading } = useQuery({ queryKey: ['active-jobs'], queryFn: fetchActiveJobs });
  const { data: queuedJobs, isLoading: queuedLoading } = useQuery({ queryKey: ['queued-jobs'], queryFn: fetchQueuedJobs });

  const loading = statsLoading || statusLoading;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">Production Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Active jobs and machine queue</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" className="h-28" />) : (<>
          <StatCard label="Total Jobs" value={stats?.production_jobs?.total ?? 0} icon={<Factory />} accent="brand" href="/production" />
          <StatCard
            label="In Progress"
            value={productionStatus?.in_progress ?? 0}
            icon={<Clock />}
            accent="success"
            badges={stats?.production_jobs?.queued ? [{ label: `${stats.production_jobs.queued} queued`, variant: 'warning' }] : undefined}
          />
          <StatCard label="Scheduled Today" value={productionStatus?.scheduled_today ?? 0} icon={<CalendarCheck />} accent="info" />
          <StatCard label="Overdue" value={productionStatus?.overdue ?? 0} icon={<AlertTriangle />} accent="danger" />
        </>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card variant="elevated" padding="none">
          <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--color-border-subtle)]">
            <CardTitle>Active Jobs</CardTitle>
            <button onClick={() => router.push('/production')} className="text-xs text-[var(--color-brand)] hover:underline">View all →</button>
          </div>
          {activeLoading ? (
            <div className="p-5 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)}</div>
          ) : !(activeJobs?.data?.length) ? (
            <div className="px-5 py-8 text-center text-sm text-[var(--color-text-secondary)]">No active jobs</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  {['Job #', 'Product', 'Machine', 'Stage', 'Elapsed'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {activeJobs.data.map((job: any) => (
                  <tr key={job.id} onClick={() => router.push(`/production/${job.id}`)} className="hover:bg-[var(--color-brand-light)] cursor-pointer transition-colors">
                    <td className="px-5 py-4 font-mono font-semibold text-sm text-[var(--color-brand)]">{job.job_number}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-primary)]">{job.product_name || '—'}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">{job.machine_name || '—'}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">{job.current_stage || '—'}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-tertiary)]">{elapsedSince(job.actual_start_date) ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card variant="elevated" padding="none">
          <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--color-border-subtle)]">
            <CardTitle>Queue</CardTitle>
            <button onClick={() => router.push('/production')} className="text-xs text-[var(--color-brand)] hover:underline">View all →</button>
          </div>
          {queuedLoading ? (
            <div className="p-5 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="text" className="h-10" />)}</div>
          ) : !(queuedJobs?.data?.length) ? (
            <div className="px-5 py-8 text-center text-sm text-[var(--color-text-secondary)]">Queue is empty</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  {['Job #', 'Product', 'Priority'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {queuedJobs.data.map((job: any, idx: number) => (
                  <tr key={job.id} onClick={() => router.push(`/production/${job.id}`)} className="hover:bg-[var(--color-brand-light)] cursor-pointer transition-colors">
                    <td className="px-5 py-4 font-mono font-semibold text-sm text-[var(--color-brand)]">{job.job_number}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-primary)]">{job.product_name || '—'}</td>
                    <td className="px-5 py-4">{jobStatusPill(job.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
