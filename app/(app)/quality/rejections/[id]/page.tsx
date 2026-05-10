'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  XOctagon,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  FileText,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { qualityService } from '@/lib/services/quality.service';

const DISPOSITION_LABELS: Record<string, string> = {
  scrap: 'Scrap',
  rework: 'Rework',
  concession: 'Concession',
  return_to_supplier: 'Return to Supplier',
};

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

function formatCurrency(val?: string | number) {
  if (val === undefined || val === null) return '—';
  return `PKR ${Number(val).toLocaleString()}`;
}

export default function RejectionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [correctiveAction, setCorrectiveAction] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: rejection, isLoading, error } = useQuery({
    queryKey: ['rejection', id],
    queryFn: () => qualityService.rejections.getOne(id),
    select: (data) => {
      if (correctiveAction === null) setCorrectiveAction(data.corrective_action ?? '');
      return data;
    },
  });

  const resolveMutation = useMutation({
    mutationFn: () => qualityService.rejections.resolve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rejection', id] }),
  });

  async function saveCorrectiveAction() {
    if (correctiveAction === null) return;
    setSaving(true);
    try {
      await qualityService.rejections.update(id, { corrective_action: correctiveAction });
      queryClient.invalidateQueries({ queryKey: ['rejection', id] });
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton variant="text" className="h-8 w-64" />
        <Card variant="elevated" padding="lg">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="text" className="h-6" />)}
          </div>
        </Card>
      </div>
    );
  }

  if (error || !rejection) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-lg font-medium text-[var(--color-text-primary)]">Rejection not found</p>
        <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.back()}>
          Back
        </Button>
      </div>
    );
  }

  const fields = [
    { label: 'Rejection Number', value: rejection.rejection_number },
    { label: 'Job', value: rejection.production_jobs?.job_number ?? rejection.job_id.slice(0, 8) + '…', mono: true },
    { label: 'Rejected Quantity', value: `${rejection.rejected_quantity} ${rejection.unit}` },
    { label: 'Disposition', value: DISPOSITION_LABELS[rejection.disposition] ?? rejection.disposition },
    { label: 'Estimated Loss', value: formatCurrency(rejection.estimated_loss) },
    { label: 'Created', value: formatDate(rejection.created_at) },
    { label: 'Resolved At', value: formatDate(rejection.resolved_at) },
    { label: 'Reason', value: rejection.reason, fullWidth: true },
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
            <XOctagon className="w-6 h-6 text-red-500" />
            {rejection.rejection_number}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Quality Rejection Detail</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">
            {DISPOSITION_LABELS[rejection.disposition] ?? rejection.disposition}
          </Badge>
          {rejection.is_resolved ? (
            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2.5 py-1 rounded-full font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full font-medium">
              <Clock className="w-3.5 h-3.5" /> Open
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <Card variant="elevated" padding="lg">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--color-text-secondary)]" />
          Rejection Details
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
          {fields.map(({ label, value, mono, fullWidth }) => (
            <div key={label} className={fullWidth ? 'col-span-2' : ''}>
              <dt className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-0.5">
                {label}
              </dt>
              <dd className={`text-sm text-[var(--color-text-primary)] ${mono ? 'font-mono' : ''}`}>
                {String(value)}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* Corrective Action */}
      <Card variant="elevated" padding="lg">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
          Corrective Action
        </h2>
        <textarea
          rows={4}
          value={correctiveAction ?? ''}
          onChange={(e) => setCorrectiveAction(e.target.value)}
          placeholder="Describe the corrective action taken or planned…"
          className="w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-none mb-3"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={saveCorrectiveAction}
          disabled={saving || correctiveAction === (rejection.corrective_action ?? '')}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </Card>

      {/* Resolve */}
      {!rejection.is_resolved && (
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                Mark as Resolved
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                Confirm that this rejection has been fully addressed and closed.
              </p>
            </div>
            <Button
              variant="primary"
              icon={<CheckCircle2 className="w-4 h-4" />}
              onClick={() => resolveMutation.mutate()}
              disabled={resolveMutation.isPending}
            >
              {resolveMutation.isPending ? 'Resolving…' : 'Resolve'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
