'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  XOctagon,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Plus,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  qualityService,
  type QualityRejection,
  type CreateRejectionPayload,
} from '@/lib/services/quality.service';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const FILTER_OPTIONS = [
  { value: '', label: 'All Rejections' },
  { value: 'false', label: 'Unresolved' },
  { value: 'true', label: 'Resolved' },
];

const DISPOSITION_OPTIONS = [
  { value: 'scrap', label: 'Scrap' },
  { value: 'rework', label: 'Rework' },
  { value: 'concession', label: 'Concession' },
  { value: 'return_to_supplier', label: 'Return to Supplier' },
];

const UNIT_OPTIONS = [
  { value: 'sheets', label: 'Sheets' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'kg', label: 'Kg' },
  { value: 'rolls', label: 'Rolls' },
  { value: 'boxes', label: 'Boxes' },
];

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(val?: string | number) {
  if (val === undefined || val === null) return '—';
  return `PKR ${Number(val).toLocaleString()}`;
}

interface ProductionJob {
  id: string;
  job_number: string;
  status: string;
}

function CreateRejectionModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<CreateRejectionPayload>({
    job_id: '',
    rejected_quantity: 1,
    unit: 'sheets',
    reason: '',
    disposition: 'scrap',
    estimated_loss: undefined,
    corrective_action: '',
  });
  const [jobSearch, setJobSearch] = useState('');
  const [error, setError] = useState('');

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['production-jobs-picker', jobSearch],
    queryFn: async (): Promise<ProductionJob[]> => {
      const q = new URLSearchParams({ limit: '20' });
      if (jobSearch) q.set('search', jobSearch);
      const res = await fetch(`${API_BASE}/production?${q}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      return data.data ?? data;
    },
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () => qualityService.rejections.create(form),
    onSuccess: () => {
      onCreated();
      onClose();
      setForm({ job_id: '', rejected_quantity: 1, unit: 'sheets', reason: '', disposition: 'scrap', estimated_loss: undefined, corrective_action: '' });
      setJobSearch('');
      setError('');
    },
    onError: (err: Error) => setError(err.message),
  });

  const jobOptions = [
    { value: '', label: jobsLoading ? 'Loading jobs…' : 'Select a job' },
    ...(jobs ?? []).map((j) => ({ value: j.id, label: `${j.job_number} — ${j.status}` })),
  ];

  const isValid = form.job_id && form.reason && form.rejected_quantity > 0;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="New Rejection"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => { setError(''); mutation.mutate(); }}
            disabled={!isValid || mutation.isPending}
          >
            {mutation.isPending ? 'Creating…' : 'Create Rejection'}
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

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">
            Production Job <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Search job number…"
            value={jobSearch}
            onChange={(e) => setJobSearch(e.target.value)}
            className="mb-2"
          />
          <Select
            options={jobOptions}
            value={form.job_id}
            onChange={(e) => setForm(f => ({ ...f, job_id: e.target.value }))}
            fullWidth
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text-primary)]">
              Quantity <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              value={String(form.rejected_quantity)}
              onChange={(e) => setForm(f => ({ ...f, rejected_quantity: parseInt(e.target.value) || 1 }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text-primary)]">Unit</label>
            <Select
              options={UNIT_OPTIONS}
              value={form.unit}
              onChange={(e) => setForm(f => ({ ...f, unit: e.target.value }))}
              fullWidth
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">
            Reason <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Why is this being rejected?"
            value={form.reason}
            onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text-primary)]">Disposition</label>
            <Select
              options={DISPOSITION_OPTIONS}
              value={form.disposition}
              onChange={(e) => setForm(f => ({ ...f, disposition: e.target.value }))}
              fullWidth
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text-primary)]">Estimated Loss (PKR)</label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={form.estimated_loss !== undefined ? String(form.estimated_loss) : ''}
              onChange={(e) => setForm(f => ({ ...f, estimated_loss: e.target.value ? parseFloat(e.target.value) : undefined }))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">Corrective Action</label>
          <textarea
            rows={2}
            value={form.corrective_action}
            onChange={(e) => setForm(f => ({ ...f, corrective_action: e.target.value }))}
            placeholder="What action is being taken? (optional)"
            className="w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}

export default function Rejections() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [resolvedFilter, setResolvedFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['rejections', page, resolvedFilter],
    queryFn: () =>
      qualityService.rejections.list({
        page,
        limit: 15,
        is_resolved: resolvedFilter === '' ? undefined : resolvedFilter === 'true',
      }),
  });

  const totalPages = data?.pages ?? 1;
  const unresolvedCount = data?.data.filter(r => !r.is_resolved).length ?? 0;
  const totalLoss = data?.data.reduce((sum, r) => sum + (r.estimated_loss ? parseFloat(r.estimated_loss) : 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Rejections</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {data ? `${data.total} rejections` : 'Quality rejections and dispositions'}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreate(true)}
        >
          New Rejection
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <XOctagon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-900">{isLoading ? '—' : (data?.total ?? 0)}</p>
              <p className="text-xs text-red-700">Total</p>
            </div>
          </div>
        </Card>
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-900">{isLoading ? '—' : unresolvedCount}</p>
              <p className="text-xs text-yellow-700">Unresolved</p>
            </div>
          </div>
        </Card>
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">{isLoading ? '—' : `${totalLoss.toLocaleString()}`}</p>
              <p className="text-xs text-purple-700">Est. Loss (PKR)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card variant="elevated" padding="md">
        <div className="flex items-center gap-3">
          <div className="w-52">
            <Select
              options={FILTER_OPTIONS}
              value={resolvedFilter}
              onChange={(e) => { setResolvedFilter(e.target.value); setPage(1); }}
              fullWidth
            />
          </div>
          {resolvedFilter && (
            <Button variant="ghost" size="sm" onClick={() => { setResolvedFilter(''); setPage(1); }}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card variant="elevated" padding="none">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)}
          </div>
        ) : error ? (
          <div className="p-6">
            <EmptyState icon={<AlertCircle />} title="Failed to load rejections" description="Check your connection and try again." />
          </div>
        ) : !data?.data.length ? (
          <div className="p-6">
            <EmptyState
              icon={<XOctagon />}
              title="No rejections found"
              description={resolvedFilter ? 'Try a different filter.' : 'Rejections appear here when production jobs fail quality checks.'}
              action={{ label: 'New Rejection', icon: <Plus className="w-4 h-4" />, onClick: () => setShowCreate(true) }}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-page-bg)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Rejection #</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Job</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Qty</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Disposition</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Est. Loss</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {data.data.map((r: QualityRejection) => (
                    <tr
                      key={r.id}
                      onClick={() => router.push(`/quality/rejections/${r.id}`)}
                      className="hover:bg-[var(--color-border-subtle)] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-primary)]">
                        {r.rejection_number}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">
                        {(r as QualityRejection & { production_jobs?: { job_number: string } }).production_jobs?.job_number ?? r.job_id.slice(0, 8) + '…'}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-primary)]">
                        {r.rejected_quantity} {r.unit}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default">
                          {r.disposition.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {formatCurrency(r.estimated_loss)}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {formatDate(r.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {r.is_resolved ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Resolved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full font-medium">
                            <Clock className="w-3 h-3" /> Open
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-4 border-t border-[var(--color-border-subtle)]">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={data.total}
                  itemsPerPage={15}
                />
              </div>
            )}
          </>
        )}
      </Card>

      <CreateRejectionModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['rejections'] })}
      />
    </div>
  );
}
