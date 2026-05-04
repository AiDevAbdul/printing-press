import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Clock, CheckCircle2, AlertTriangle,
  Layers, ChevronRight, Calendar, User
} from 'lucide-react';
import api from '../../services/api';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BentoGrid, BentoCell } from '../../components/ui/BentoGrid';
import { Skeleton } from '../../components/ui/Skeleton';

interface DashboardStats {
  production_jobs: { queued: number; in_progress: number; paused: number; completed: number; total: number };
  low_stock_items: number;
}

interface ProductionStatus {
  in_progress: number;
  scheduled_today: number;
  overdue: number;
}

interface ProductionJob {
  id: string;
  job_number: string;
  status: string;
  current_stage?: string;
  current_process?: string;
  assigned_machine?: string;
  scheduled_start_date?: string;
  scheduled_end_date?: string;
  order?: { order_number: string; customer?: { name: string } };
  assigned_operator?: { full_name: string };
}

const statusMap: Record<string, { label: string; variant: 'status' | 'default'; status?: 'in_progress' | 'queued' | 'paused' | 'completed' | 'cancelled' }> = {
  in_progress: { label: 'In Progress', variant: 'status', status: 'in_progress' },
  queued:      { label: 'Queued',      variant: 'status', status: 'queued' },
  paused:      { label: 'Paused',      variant: 'status', status: 'paused' },
  completed:   { label: 'Completed',   variant: 'status', status: 'completed' },
  cancelled:   { label: 'Cancelled',   variant: 'status', status: 'cancelled' },
};

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-surface rounded-lg border border-[var(--color-border-subtle)] p-5 space-y-3">
          <Skeleton variant="text" width="60%" />
          <Skeleton height={32} width="40%" />
        </div>
      ))}
    </div>
  );
}

export default function ProductionDashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await api.get('/dashboard/stats')).data,
    staleTime: 30_000,
  });

  const { data: prodStatus, isLoading: statusLoading } = useQuery<ProductionStatus>({
    queryKey: ['production-status'],
    queryFn: async () => (await api.get('/dashboard/production-status')).data,
    staleTime: 30_000,
  });

  const { data: queueRaw, isLoading: queueLoading } = useQuery<{ data?: ProductionJob[]; jobs?: ProductionJob[] } | ProductionJob[]>({
    queryKey: ['production-queue'],
    queryFn: async () => (await api.get('/production/queue')).data,
    staleTime: 15_000,
  });

  const queue: ProductionJob[] = Array.isArray(queueRaw)
    ? queueRaw
    : (queueRaw as any)?.data ?? (queueRaw as any)?.jobs ?? [];

  const jobs = stats?.production_jobs;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
            Production
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Live view of all active production jobs
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => navigate('/production')}>
          All Jobs
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Stats */}
      {statsLoading || statusLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Active Jobs"
            value={jobs?.in_progress ?? 0}
            icon={<Activity className="w-5 h-5" />}
            color="brand"
          />
          <StatCard
            label="Queued"
            value={jobs?.queued ?? 0}
            icon={<Layers className="w-5 h-5" />}
            color="info"
          />
          <StatCard
            label="Overdue"
            value={prodStatus?.overdue ?? 0}
            icon={<AlertTriangle className="w-5 h-5" />}
            color={prodStatus?.overdue ? 'danger' : 'success'}
          />
          <StatCard
            label="Completed"
            value={jobs?.completed ?? 0}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="success"
          />
        </div>
      )}

      {/* Main bento grid */}
      <BentoGrid columns={3}>
        {/* Production queue — spans 2 columns */}
        <BentoCell colSpan={2}>
          <Card variant="default" padding="none">
            <div className="px-5 py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
              <CardTitle>Production Queue</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/production')}>
                View all
              </Button>
            </div>
            {queueLoading ? (
              <div className="p-5 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton width="20%" height={16} />
                    <Skeleton width="30%" height={16} />
                    <Skeleton width="15%" height={24} className="rounded-full" />
                    <Skeleton width="20%" height={16} className="ml-auto" />
                  </div>
                ))}
              </div>
            ) : queue.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-success)' }} />
                <p className="text-sm font-medium text-[var(--color-text-primary)]">Queue is clear</p>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">No jobs waiting</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border-subtle)]">
                      {['Job', 'Order / Customer', 'Stage', 'Status', 'Operator', 'Due'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-subtle)]">
                    {queue.slice(0, 10).map((job) => {
                      const s = statusMap[job.status];
                      return (
                        <tr
                          key={job.id}
                          className="hover:bg-[var(--color-page-bg)] transition-colors duration-fast cursor-pointer"
                          onClick={() => navigate(`/production/${job.id}`)}
                        >
                          <td className="px-4 py-3 font-medium text-[var(--color-text-primary)] whitespace-nowrap">
                            {job.job_number}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-[var(--color-text-primary)]">
                              {job.order?.order_number || '—'}
                            </div>
                            <div className="text-xs text-[var(--color-text-tertiary)]">
                              {job.order?.customer?.name || ''}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                            {job.current_process || job.current_stage || '—'}
                          </td>
                          <td className="px-4 py-3">
                            {s ? (
                              <Badge variant={s.variant} status={s.status} dot>
                                {s.label}
                              </Badge>
                            ) : (
                              <Badge variant="default">{job.status}</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {job.assigned_operator && <User className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />}
                              {job.assigned_operator?.full_name || '—'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {job.scheduled_end_date && <Calendar className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />}
                              {job.scheduled_end_date
                                ? new Date(job.scheduled_end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                                : '—'}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </BentoCell>

        {/* Status summary */}
        <BentoCell>
          <Card variant="default" padding="none" className="h-full">
            <div className="px-5 py-4 border-b border-[var(--color-border-subtle)]">
              <CardTitle>Job Status</CardTitle>
            </div>
            <div className="p-5 space-y-4">
              {statsLoading ? (
                [...Array(5)].map((_, i) => <Skeleton key={i} height={20} />)
              ) : (
                [
                  { label: 'In Progress', value: jobs?.in_progress ?? 0, color: 'var(--color-status-running)' },
                  { label: 'Queued',      value: jobs?.queued ?? 0,      color: 'var(--color-status-queued)' },
                  { label: 'Paused',      value: jobs?.paused ?? 0,      color: 'var(--color-status-paused)' },
                  { label: 'Completed',   value: jobs?.completed ?? 0,   color: 'var(--color-status-done)' },
                  { label: 'Overdue',     value: prodStatus?.overdue ?? 0, color: 'var(--color-status-blocked)' },
                ].map(({ label, value, color }) => {
                  const total = Math.max(jobs?.total ?? 1, 1);
                  const pct = Math.round((value / total) * 100);
                  return (
                    <div key={label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
                        <span className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">{value}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--color-border-subtle)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-slow"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Today's schedule */}
            <div className="px-5 pb-5 mt-2">
              <div className="rounded-lg bg-brand-light p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-brand" />
                  <span className="text-sm font-medium text-brand">Today</span>
                </div>
                <div className="text-2xl font-semibold text-[var(--color-text-primary)] tabular-nums">
                  {statusLoading ? '—' : prodStatus?.scheduled_today ?? 0}
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  jobs scheduled
                </div>
              </div>
            </div>
          </Card>
        </BentoCell>
      </BentoGrid>
    </div>
  );
}
