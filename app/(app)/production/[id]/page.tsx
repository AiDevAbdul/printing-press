'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Factory, Clock, CheckCircle2, PauseCircle,
  AlertCircle, Calendar, User, Settings2, Edit3, Check, X,
  ExternalLink, TrendingUp, BarChart3, Layers,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui/Select';
import { productionService, type ProductionJob, type WorkflowStage } from '@/lib/services/production.service';

const STATUS_OPTIONS = [
  { value: 'queued', label: 'Queued' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STAGE_ICONS: Record<string, React.ReactNode> = {
  'Pre-Press':     <Layers className="w-4 h-4" />,
  'Plate Making':  <Settings2 className="w-4 h-4" />,
  'Machine Setup': <Settings2 className="w-4 h-4" />,
  'Printing':      <Factory className="w-4 h-4" />,
  'Finishing':     <TrendingUp className="w-4 h-4" />,
  'Quality Check': <CheckCircle2 className="w-4 h-4" />,
  'Dispatch':      <BarChart3 className="w-4 h-4" />,
};

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDuration(minutes: number) {
  if (!minutes) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function StageStatusIcon({ status }: { status: string }) {
  if (status === 'completed') return <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />;
  if (status === 'in_progress') return (
    <span className="relative flex w-5 h-5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-info)] opacity-40" />
      <span className="relative inline-flex rounded-full w-5 h-5 bg-[var(--color-info)] items-center justify-center">
        <Clock className="w-3 h-3 text-white" />
      </span>
    </span>
  );
  if (status === 'paused') return <PauseCircle className="w-5 h-5 text-[var(--color-warning)]" />;
  return <span className="w-5 h-5 rounded-full border-2 border-[var(--color-border)] bg-[var(--color-page-bg)]" />;
}

function WorkflowTimeline({ stages }: { stages: WorkflowStage[] }) {
  if (!stages.length) return (
    <div className="text-sm text-[var(--color-text-tertiary)] py-8 text-center">
      No workflow stages recorded yet.
    </div>
  );

  return (
    <div className="overflow-x-auto pb-2">
      {/* Desktop: horizontal timeline */}
      <div className="hidden sm:flex items-start gap-0 min-w-max">
        {stages.map((stage, idx) => {
          const isLast = idx === stages.length - 1;
          const active = stage.status === 'in_progress';
          const done = stage.status === 'completed';

          return (
            <div key={stage.id} className="flex items-start">
              <div className="flex flex-col items-center w-40">
                {/* Stage node */}
                <div className={[
                  'flex flex-col items-center gap-2 p-3 rounded-xl w-full transition-all',
                  active ? 'bg-[var(--color-info-bg)] ring-1 ring-[var(--color-info)]' : '',
                  done ? 'bg-[var(--color-success-bg)]' : '',
                  !active && !done ? 'bg-[var(--color-page-bg)]' : '',
                ].join(' ')}>
                  <StageStatusIcon status={stage.status} />
                  <span className={`text-xs font-semibold text-center leading-tight ${done ? 'text-[var(--color-success)]' : active ? 'text-[var(--color-info)]' : 'text-[var(--color-text-secondary)]'}`}>
                    {stage.stage_name}
                  </span>
                  <Badge
                    variant="status"
                    status={stage.status === 'in_progress' ? 'in_progress' : stage.status === 'completed' ? 'completed' : stage.status === 'paused' ? 'paused' : 'queued' as any}
                  >
                    {stage.status.replace(/_/g, ' ')}
                  </Badge>
                  {stage.active_duration_minutes > 0 && (
                    <span className="text-xs text-[var(--color-text-tertiary)]">{fmtDuration(stage.active_duration_minutes)}</span>
                  )}
                  {stage.operator_name && (
                    <div className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                      <User className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{stage.operator_name}</span>
                    </div>
                  )}
                  {stage.machine && (
                    <div className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                      <Settings2 className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{stage.machine}</span>
                    </div>
                  )}
                  {stage.qa_approval_required && (
                    <div className={`text-xs px-1.5 py-0.5 rounded-full ${
                      stage.qa_approval_status === 'approved' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' :
                      stage.qa_approval_status === 'rejected' ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]' :
                      'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'
                    }`}>
                      QA: {stage.qa_approval_status ?? 'pending'}
                    </div>
                  )}
                  {stage.notes && (
                    <p className="text-xs text-[var(--color-text-tertiary)] text-center line-clamp-2">{stage.notes}</p>
                  )}
                </div>
              </div>
              {/* Connector */}
              {!isLast && (
                <div className="flex items-center mt-6 w-6">
                  <div className={`h-0.5 w-full ${done ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical timeline */}
      <div className="sm:hidden space-y-0">
        {stages.map((stage, idx) => {
          const isLast = idx === stages.length - 1;
          const active = stage.status === 'in_progress';
          const done = stage.status === 'completed';

          return (
            <div key={stage.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="mt-3">
                  <StageStatusIcon status={stage.status} />
                </div>
                {!isLast && <div className={`w-0.5 flex-1 mt-2 ${done ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]'}`} />}
              </div>
              <div className={`flex-1 mb-4 p-3 rounded-xl ${active ? 'bg-[var(--color-info-bg)]' : done ? 'bg-[var(--color-success-bg)]' : 'bg-[var(--color-page-bg)]'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">{stage.stage_name}</span>
                  <Badge variant="status" status={stage.status as any}>{stage.status.replace(/_/g, ' ')}</Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-tertiary)]">
                  {stage.operator_name && <span><User className="w-3 h-3 inline mr-1" />{stage.operator_name}</span>}
                  {stage.machine && <span><Settings2 className="w-3 h-3 inline mr-1" />{stage.machine}</span>}
                  {stage.active_duration_minutes > 0 && <span><Clock className="w-3 h-3 inline mr-1" />{fmtDuration(stage.active_duration_minutes)}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProductionDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const qc = useQueryClient();

  const [editStatus, setEditStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const { data: job, isLoading, error } = useQuery<ProductionJob>({
    queryKey: ['production-job', id],
    queryFn: () => productionService.getById(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ProductionJob>) => productionService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['production-job', id] });
      qc.invalidateQueries({ queryKey: ['production'] });
      setEditStatus(false);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-10 h-10 text-[var(--color-danger)]" />
        <p className="text-[var(--color-text-secondary)]">Production job not found.</p>
        <Button variant="ghost" onClick={() => router.push('/production')}>Back to Production</Button>
      </div>
    );
  }

  const stages = job.production_workflow_stages ?? [];
  const completedStages = stages.filter(s => s.status === 'completed').length;
  const progressPct = job.progress_percent ?? (stages.length ? Math.round((completedStages / stages.length) * 100) : 0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.push('/production')}
          className="mt-1 p-1.5 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] transition-colors"
          aria-label="Back to production"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] font-mono">
              {job.job_number}
            </h1>
            {editStatus ? (
              <div className="flex items-center gap-2">
                <div className="w-36">
                  <Select
                    options={STATUS_OPTIONS}
                    value={newStatus || job.status}
                    onChange={e => setNewStatus(e.target.value)}
                    fullWidth
                  />
                </div>
                <button
                  onClick={() => updateMutation.mutate({ status: newStatus as any || job.status as any })}
                  className="p-1 text-[var(--color-success)] hover:bg-[var(--color-success-bg)] rounded"
                  disabled={updateMutation.isPending}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditStatus(false)} className="p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-border-subtle)] rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => { setEditStatus(true); setNewStatus(job.status); }} className="group flex items-center gap-1.5">
                <Badge variant="status" status={job.status as any} dot>
                  {job.status.replace(/_/g, ' ')}
                </Badge>
                <Edit3 className="w-3 h-3 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
          {job.orders && (
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-[var(--color-text-secondary)]">
              <span>{job.orders.product_name}</span>
              {job.orders.customers?.name && <span>· {job.orders.customers.name}</span>}
              <button
                onClick={() => router.push(`/orders/${job.order_id}`)}
                className="flex items-center gap-1 text-[var(--color-brand)] hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                {job.orders.order_number}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Scheduled Start', value: fmt(job.scheduled_start_date), icon: <Calendar className="w-4 h-4" /> },
          { label: 'Scheduled End', value: fmt(job.scheduled_end_date), icon: <Calendar className="w-4 h-4" /> },
          { label: 'Operator', value: job.users?.full_name ?? job.assigned_operator ?? '—', icon: <User className="w-4 h-4" /> },
          { label: 'Machine', value: job.assigned_machine ?? '—', icon: <Settings2 className="w-4 h-4" /> },
        ].map(m => (
          <Card key={m.label} variant="elevated" padding="md">
            <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] mb-1">
              {m.icon}
              <span className="text-xs font-medium uppercase tracking-wide">{m.label}</span>
            </div>
            <div className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{m.value}</div>
          </Card>
        ))}
      </div>

      {/* Progress bar */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Overall Progress</span>
            {job.current_stage && (
              <span className="ml-2 text-xs text-[var(--color-text-tertiary)]">Current: {job.current_stage}</span>
            )}
          </div>
          <span className="text-sm font-bold text-[var(--color-brand)]">{progressPct}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-[var(--color-border-subtle)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-brand)] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {stages.length > 0 && (
          <div className="flex justify-between mt-2 text-xs text-[var(--color-text-tertiary)]">
            <span>{completedStages} of {stages.length} stages complete</span>
            {job.estimated_hours && <span>Est. {job.estimated_hours}h total</span>}
          </div>
        )}
      </Card>

      {/* Workflow Timeline */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Factory className="w-4 h-4 text-[var(--color-brand)]" />
            <CardTitle>Workflow Stages</CardTitle>
          </div>
        </CardHeader>
        <WorkflowTimeline stages={stages} />
      </Card>

      {/* Job details */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Timing</CardTitle>
          </CardHeader>
          <dl className="space-y-3 text-sm">
            {[
              { label: 'Actual Start', value: fmt(job.actual_start_date) },
              { label: 'Actual End', value: fmt(job.actual_end_date) },
              { label: 'Estimated Hours', value: job.estimated_hours ? `${job.estimated_hours}h` : '—' },
              { label: 'Actual Hours', value: job.actual_hours ? `${job.actual_hours}h` : '—' },
            ].map(r => (
              <div key={r.label} className="flex justify-between">
                <dt className="text-[var(--color-text-tertiary)]">{r.label}</dt>
                <dd className="font-medium text-[var(--color-text-primary)]">{r.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Quality</CardTitle>
          </CardHeader>
          <dl className="space-y-3 text-sm">
            {[
              { label: 'Quality Status', value: job.quality_status?.replace(/_/g, ' ') ?? '—' },
              { label: 'Queue Position', value: job.queue_position ?? '—' },
            ].map(r => (
              <div key={r.label} className="flex justify-between">
                <dt className="text-[var(--color-text-tertiary)]">{r.label}</dt>
                <dd className="font-medium text-[var(--color-text-primary)]">{String(r.value)}</dd>
              </div>
            ))}
          </dl>
          {job.notes && (
            <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
              <dt className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide mb-1">Notes</dt>
              <dd className="text-sm text-[var(--color-text-primary)] bg-[var(--color-page-bg)] rounded-md p-3">{job.notes}</dd>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
