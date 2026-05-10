'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  FileText,
  Plus,
  Bug,
  Trash2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  qualityService,
  type QualityDefect,
  type CreateDefectPayload,
} from '@/lib/services/quality.service';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'rework', label: 'Rework' },
];

const DEFECT_CATEGORIES = [
  { value: 'color_registration', label: 'Color Registration' },
  { value: 'ink_density', label: 'Ink Density' },
  { value: 'cutting', label: 'Cutting' },
  { value: 'folding', label: 'Folding' },
  { value: 'surface_defect', label: 'Surface Defect' },
  { value: 'binding', label: 'Binding' },
  { value: 'other', label: 'Other' },
];

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

function severityVariant(s: string): 'success' | 'warning' | 'danger' | 'default' {
  if (s === 'low') return 'success';
  if (s === 'medium') return 'warning';
  if (s === 'high' || s === 'critical') return 'danger';
  return 'default';
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusIcon({ status }: { status?: string }) {
  if (status === 'passed') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
  if (status === 'failed') return <XCircle className="w-5 h-5 text-red-500" />;
  if (status === 'rework') return <AlertCircle className="w-5 h-5 text-orange-500" />;
  return <Clock className="w-5 h-5 text-yellow-500" />;
}

function LogDefectModal({
  open,
  onClose,
  inspectionId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  inspectionId: string;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<CreateDefectPayload>({
    inspection_id: inspectionId,
    category: '',
    severity: 'medium',
    description: '',
    quantity: 1,
    root_cause: '',
    corrective_action: '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => qualityService.defects.create({ ...form, inspection_id: inspectionId }),
    onSuccess: () => {
      onCreated();
      onClose();
      setForm({ inspection_id: inspectionId, category: '', severity: 'medium', description: '', quantity: 1, root_cause: '', corrective_action: '' });
      setError('');
    },
    onError: (err: Error) => setError(err.message),
  });

  const isValid = form.category && form.severity && form.description;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Log Defect"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => { setError(''); mutation.mutate(); }}
            disabled={!isValid || mutation.isPending}
          >
            {mutation.isPending ? 'Saving…' : 'Log Defect'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text-primary)]">
              Category <span className="text-red-500">*</span>
            </label>
            <Select
              options={[{ value: '', label: 'Select category' }, ...DEFECT_CATEGORIES]}
              value={form.category}
              onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
              fullWidth
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text-primary)]">
              Severity <span className="text-red-500">*</span>
            </label>
            <Select
              options={SEVERITY_OPTIONS}
              value={form.severity}
              onChange={(e) => setForm(f => ({ ...f, severity: e.target.value }))}
              fullWidth
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">
            Description <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Describe the defect…"
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">Quantity</label>
          <Input
            type="number"
            min="1"
            value={String(form.quantity ?? 1)}
            onChange={(e) => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">Root Cause</label>
          <textarea
            rows={2}
            value={form.root_cause}
            onChange={(e) => setForm(f => ({ ...f, root_cause: e.target.value }))}
            placeholder="What caused this defect? (optional)"
            className="w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">Corrective Action</label>
          <textarea
            rows={2}
            value={form.corrective_action}
            onChange={(e) => setForm(f => ({ ...f, corrective_action: e.target.value }))}
            placeholder="What action was taken? (optional)"
            className="w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}

export default function QualityDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showLogDefect, setShowLogDefect] = useState(false);

  const { data: inspection, isLoading, error } = useQuery({
    queryKey: ['quality', id],
    queryFn: () => qualityService.getOne(id),
  });

  const updateMutation = useMutation({
    mutationFn: (status: string) => qualityService.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quality'] }),
  });

  const deleteDefectMutation = useMutation({
    mutationFn: (defectId: string) => qualityService.defects.delete(defectId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quality', id] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" className="h-8 w-64" />
        <Card variant="elevated" padding="lg">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="text" className="h-6" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-lg font-medium text-[var(--color-text-primary)]">Inspection not found</p>
        <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.back()}>
          Back
        </Button>
      </div>
    );
  }

  const defects: QualityDefect[] = inspection.quality_defects ?? [];

  const fields = [
    { label: 'Inspection Number', value: inspection.inspection_number || inspection.id.slice(0, 8) },
    { label: 'Job ID', value: inspection.job_id ? inspection.job_id.slice(0, 8) + '…' : '—', mono: true },
    { label: 'Checkpoint', value: inspection.quality_checkpoints?.name ?? '—' },
    { label: 'Stage', value: inspection.quality_checkpoints?.stage ?? '—' },
    { label: 'Inspected At', value: formatDate(inspection.inspected_at) },
    { label: 'Created', value: formatDate(inspection.created_at) },
    { label: 'Sample Size', value: inspection.sample_size ?? '—' },
    { label: 'Defects Found', value: defects.length > 0 ? defects.length : (inspection.defects_found ?? '—') },
    { label: 'Failure Reason', value: inspection.failure_reason || '—' },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.back()}>
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[var(--color-brand)]" />
            {inspection.inspection_number || 'Inspection'}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Quality Inspection Detail</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon status={inspection.status} />
          <Badge variant="status" status={
            (['pending','approved','in_progress','completed','delivered','cancelled','rejected','paused','queued','running','blocked'].includes(inspection.status)
              ? inspection.status as 'pending' | 'approved' | 'in_progress' | 'completed' | 'delivered' | 'cancelled' | 'rejected' | 'paused' | 'queued' | 'running' | 'blocked'
              : 'pending')
          } dot>
            {inspection.status.replace(/_/g, ' ')}
          </Badge>
        </div>
      </div>

      {/* Details card */}
      <Card variant="elevated" padding="lg">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--color-text-secondary)]" />
          Inspection Details
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
          {fields.map(({ label, value, mono }) => (
            <div key={label}>
              <dt className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-0.5">
                {label}
              </dt>
              <dd className={`text-sm text-[var(--color-text-primary)] ${mono ? 'font-mono' : ''}`}>
                {String(value)}
              </dd>
            </div>
          ))}
          {inspection.notes && (
            <div className="col-span-2">
              <dt className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-0.5">
                Notes
              </dt>
              <dd className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap">
                {inspection.notes}
              </dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Status update */}
      <Card variant="elevated" padding="lg">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">Update Status</h2>
        <div className="flex items-center gap-3">
          <div className="w-52">
            <Select
              options={STATUS_OPTIONS}
              value={inspection.status}
              onChange={(e) => updateMutation.mutate(e.target.value)}
              fullWidth
            />
          </div>
          {updateMutation.isPending && (
            <span className="text-sm text-[var(--color-text-secondary)]">Saving…</span>
          )}
          {updateMutation.isSuccess && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Saved
            </span>
          )}
        </div>
      </Card>

      {/* Defects */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
            <Bug className="w-4 h-4 text-[var(--color-text-secondary)]" />
            Defects
            {defects.length > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {defects.length}
              </span>
            )}
          </h2>
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowLogDefect(true)}
          >
            Log Defect
          </Button>
        </div>

        {defects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
            <p className="text-sm font-medium text-[var(--color-text-primary)]">No defects logged</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Log a defect if any issues are found during this inspection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  <th className="pb-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Category</th>
                  <th className="pb-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Severity</th>
                  <th className="pb-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Description</th>
                  <th className="pb-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Qty</th>
                  <th className="pb-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Root Cause</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {defects.map((defect) => (
                  <tr key={defect.id}>
                    <td className="py-3 pr-4 capitalize text-[var(--color-text-primary)]">
                      {defect.category.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={severityVariant(defect.severity)}>
                        {defect.severity}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-[var(--color-text-secondary)] max-w-[180px] truncate">
                      {defect.description}
                    </td>
                    <td className="py-3 pr-4 text-[var(--color-text-primary)]">{defect.quantity}</td>
                    <td className="py-3 pr-4 text-[var(--color-text-secondary)] max-w-[160px] truncate">
                      {defect.root_cause || '—'}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => deleteDefectMutation.mutate(defect.id)}
                        disabled={deleteDefectMutation.isPending}
                        className="p-1 rounded hover:bg-red-50 text-[var(--color-text-tertiary)] hover:text-red-500 transition-colors"
                        title="Delete defect"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <LogDefectModal
        open={showLogDefect}
        onClose={() => setShowLogDefect(false)}
        inspectionId={id}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['quality', id] })}
      />
    </div>
  );
}
