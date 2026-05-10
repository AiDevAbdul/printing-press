'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Factory, AlertCircle, Calendar, User,
  Settings2, Edit3, Check, X, ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import type { StatusPillStatus } from '@/components/ui/StatusPill';
import { Skeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui/Select';
import { WorkflowTimeline } from '@/components/ui/WorkflowTimeline';
import type { WorkflowStage as UIStage } from '@/components/ui/WorkflowTimeline';
import { toast } from 'sonner';
import {
  productionService,
  type ProductionJob,
  type WorkflowStage as ServiceStage,
} from '@/lib/services/production.service';

const STATUS_OPTIONS = [
  { value: 'queued', label: 'Queued' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function mapStageStatus(s: string): StatusPillStatus {
  if (s === 'in_progress') return 'in_progress';
  if (s === 'completed') return 'completed';
  if (s === 'paused') return 'paused';
  if (s === 'blocked') return 'blocked';
  return 'queued';
}

function toUIStage(s: ServiceStage): UIStage {
  return {
    id: String(s.id),
    name: s.stage_name,
    order: s.stage_order,
    status: mapStageStatus(s.status),
    operator: s.operator_name,
    machine: s.machine ?? undefined,
    startedAt: s.started_at ?? null,
    completedAt: s.completed_at ?? null,
    estimatedMinutes: s.active_duration_minutes > 0 ? s.active_duration_minutes : undefined,
  };
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

  const updateJobMutation = useMutation({
    mutationFn: (data: Partial<ProductionJob>) => productionService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['production-job', id] });
      qc.invalidateQueries({ queryKey: ['production'] });
      setEditStatus(false);
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const stageMutation = useMutation({
    mutationFn: ({ stageId, action }: { stageId: number; action: 'start' | 'pause' | 'complete' | 'flag' }) =>
      productionService.updateStage(id, stageId, action),
    onSuccess: (_, { action }) => {
      qc.invalidateQueries({ queryKey: ['production-job', id] });
      const msg = { start: 'Stage started', pause: 'Stage paused', complete: 'Stage completed', flag: 'Stage flagged' }[action];
      toast.success(msg);
    },
    onError: () => toast.error('Failed to update stage'),
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
        <AlertCircle className="w-10 h-10" style={{ color: 'var(--color-danger)' }} />
        <p style={{ color: 'var(--color-text-secondary)' }}>Production job not found.</p>
        <Button variant="ghost" onClick={() => router.push('/production')}>Back to Production</Button>
      </div>
    );
  }

  const stages = job.production_workflow_stages ?? [];
  const completedStages = stages.filter(s => s.status === 'completed').length;
  const progressPct = job.progress_percent ?? (stages.length ? Math.round((completedStages / stages.length) * 100) : 0);
  const uiStages = stages.map(toUIStage);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.push('/production')}
          className="mt-1 p-1.5 rounded-md transition-colors"
          style={{ color: 'var(--color-text-tertiary)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)';
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-border-subtle)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--color-text-tertiary)';
            (e.currentTarget as HTMLElement).style.backgroundColor = '';
          }}
          aria-label="Back to production"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold font-mono" style={{ color: 'var(--color-text-primary)' }}>
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
                  onClick={() => updateJobMutation.mutate({ status: (newStatus || job.status) as any })}
                  className="p-1 rounded transition-colors"
                  style={{ color: 'var(--color-success)' }}
                  disabled={updateJobMutation.isPending}
                  aria-label="Save status"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditStatus(false)}
                  className="p-1 rounded transition-colors"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  aria-label="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setEditStatus(true); setNewStatus(job.status); }}
                className="group flex items-center gap-1.5"
                aria-label="Edit job status"
              >
                <StatusPill status={mapStageStatus(job.status)} />
                <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-text-tertiary)' }} />
              </button>
            )}
          </div>

          {job.orders && (
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <span>{job.orders.product_name}</span>
              {job.orders.customers?.name && <span>· {job.orders.customers.name}</span>}
              <button
                onClick={() => router.push(`/orders/${job.order_id}`)}
                className="flex items-center gap-1 hover:underline"
                style={{ color: 'var(--color-brand)' }}
              >
                <ExternalLink className="w-3 h-3" />
                {job.orders.order_number}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Scheduled Start', value: fmt(job.scheduled_start_date), icon: Calendar },
          { label: 'Scheduled End', value: fmt(job.scheduled_end_date), icon: Calendar },
          { label: 'Operator', value: job.users?.full_name ?? job.assigned_operator ?? '—', icon: User },
          { label: 'Machine', value: job.assigned_machine ?? '—', icon: Settings2 },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} variant="elevated" padding="md">
            <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
            </div>
            <div className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{value}</div>
          </Card>
        ))}
      </div>

      {/* Progress */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Overall Progress</span>
            {job.current_stage && (
              <span className="ml-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                Current: {job.current_stage}
              </span>
            )}
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--color-brand)' }}>{progressPct}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border-subtle)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, backgroundColor: 'var(--color-brand)' }}
          />
        </div>
        {stages.length > 0 && (
          <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            <span>{completedStages} of {stages.length} stages complete</span>
            {job.estimated_hours && <span>Est. {job.estimated_hours}h total</span>}
          </div>
        )}
      </Card>

      {/* Workflow Timeline */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2" style={{ color: 'var(--color-brand)' }}>
            <Factory className="w-4 h-4" />
            <CardTitle>Workflow Stages</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {uiStages.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              No workflow stages recorded yet.
            </p>
          ) : (
            <WorkflowTimeline
              stages={uiStages}
              onStart={stageId => stageMutation.mutate({ stageId: parseInt(stageId), action: 'start' })}
              onPause={stageId => stageMutation.mutate({ stageId: parseInt(stageId), action: 'pause' })}
              onComplete={stageId => stageMutation.mutate({ stageId: parseInt(stageId), action: 'complete' })}
              onFlagIssue={stageId => stageMutation.mutate({ stageId: parseInt(stageId), action: 'flag' })}
            />
          )}
        </CardContent>
      </Card>

      {/* Job details */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card variant="elevated" padding="lg">
          <CardHeader><CardTitle>Timing</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {[
                { label: 'Actual Start', value: fmt(job.actual_start_date) },
                { label: 'Actual End', value: fmt(job.actual_end_date) },
                { label: 'Estimated Hours', value: job.estimated_hours ? `${job.estimated_hours}h` : '—' },
                { label: 'Actual Hours', value: job.actual_hours ? `${job.actual_hours}h` : '—' },
              ].map(r => (
                <div key={r.label} className="flex justify-between">
                  <dt style={{ color: 'var(--color-text-tertiary)' }}>{r.label}</dt>
                  <dd className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{r.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card variant="elevated" padding="lg">
          <CardHeader><CardTitle>Quality</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {[
                { label: 'Quality Status', value: job.quality_status?.replace(/_/g, ' ') ?? '—' },
                { label: 'Queue Position', value: String(job.queue_position ?? '—') },
              ].map(r => (
                <div key={r.label} className="flex justify-between">
                  <dt style={{ color: 'var(--color-text-tertiary)' }}>{r.label}</dt>
                  <dd className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{r.value}</dd>
                </div>
              ))}
            </dl>
            {job.notes && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <dt className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Notes</dt>
                <dd
                  className="text-sm rounded-lg p-3"
                  style={{ color: 'var(--color-text-primary)', backgroundColor: 'var(--color-page-bg)' }}
                >
                  {job.notes}
                </dd>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
