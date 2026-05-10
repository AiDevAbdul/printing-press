'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ShieldCheck, AlertCircle, CheckCircle2, XCircle, Clock, Plus } from 'lucide-react';
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
  type QualityInspection,
  type QualityCheckpoint,
} from '@/lib/services/quality.service';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'conditional', label: 'Conditional' },
];

const INSPECTION_TYPES = [
  { value: 'pre_press', label: 'Pre-Press' },
  { value: 'in_process', label: 'In-Process' },
  { value: 'final', label: 'Final' },
  { value: 'incoming', label: 'Incoming Materials' },
];

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ResultIcon({ result }: { result?: string }) {
  if (result === 'passed') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (result === 'failed') return <XCircle className="w-4 h-4 text-red-500" />;
  return <Clock className="w-4 h-4 text-yellow-500" />;
}

interface ProductionJob {
  id: string;
  job_number: string;
  status: string;
}

function CreateInspectionModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [jobId, setJobId] = useState('');
  const [checkpointId, setCheckpointId] = useState('');
  const [inspectionType, setInspectionType] = useState('in_process');
  const [notes, setNotes] = useState('');
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

  const { data: checkpoints, isLoading: checkpointsLoading } = useQuery({
    queryKey: ['quality-checkpoints'],
    queryFn: () => qualityService.getCheckpoints(),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () =>
      qualityService.create({ job_id: jobId, checkpoint_id: checkpointId, inspection_type: inspectionType, notes: notes || undefined }),
    onSuccess: () => {
      onCreated();
      onClose();
      resetForm();
    },
    onError: (err: Error) => setError(err.message),
  });

  function resetForm() {
    setJobId('');
    setCheckpointId('');
    setInspectionType('in_process');
    setNotes('');
    setJobSearch('');
    setError('');
  }

  function handleClose() {
    onClose();
    resetForm();
  }

  const jobOptions = [
    { value: '', label: jobsLoading ? 'Loading jobs…' : 'Select a job' },
    ...(jobs ?? []).map((j) => ({ value: j.id, label: `${j.job_number} — ${j.status}` })),
  ];

  // Group checkpoints by stage for better UX
  const checkpointOptions = [
    { value: '', label: checkpointsLoading ? 'Loading checkpoints…' : 'Select a checkpoint' },
    ...(checkpoints ?? []).map((c: QualityCheckpoint) => ({
      value: c.id,
      label: `${c.stage} — ${c.name}`,
    })),
  ];

  const isValid = jobId && checkpointId && inspectionType;

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title="New Quality Inspection"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => { setError(''); mutation.mutate(); }}
            disabled={!isValid || mutation.isPending}
          >
            {mutation.isPending ? 'Creating…' : 'Create Inspection'}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
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
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            fullWidth
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">
            Checkpoint <span className="text-red-500">*</span>
          </label>
          <Select
            options={checkpointOptions}
            value={checkpointId}
            onChange={(e) => setCheckpointId(e.target.value)}
            fullWidth
          />
          {checkpointId && checkpoints && (
            <p className="text-xs text-[var(--color-text-secondary)]">
              {checkpoints.find((c: QualityCheckpoint) => c.id === checkpointId)?.description}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">
            Inspection Type <span className="text-red-500">*</span>
          </label>
          <Select
            options={INSPECTION_TYPES}
            value={inspectionType}
            onChange={(e) => setInspectionType(e.target.value)}
            fullWidth
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional inspection notes…"
            className="w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}

export default function Quality() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['quality', page, status],
    queryFn: () => qualityService.getAll({ page, limit: 15, status: status || undefined }),
  });

  const totalPages = data?.pages ?? 1;

  const passedCount = data?.data.filter(i => i.status === 'passed').length ?? 0;
  const failedCount = data?.data.filter(i => i.status === 'failed').length ?? 0;
  const pendingCount = data?.data.filter(i => i.status === 'pending').length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Quality</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {data ? `${data.total} inspections` : 'Quality control and inspections'}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreate(true)}
        >
          New Inspection
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-900">{isLoading ? '—' : pendingCount}</p>
              <p className="text-xs text-yellow-700">Pending</p>
            </div>
          </div>
        </Card>
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{isLoading ? '—' : passedCount}</p>
              <p className="text-xs text-green-700">Passed</p>
            </div>
          </div>
        </Card>
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-900">{isLoading ? '—' : failedCount}</p>
              <p className="text-xs text-red-700">Failed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card variant="elevated" padding="md">
        <div className="flex items-center gap-3">
          <div className="w-52">
            <Select
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              fullWidth
            />
          </div>
          {status && (
            <Button variant="ghost" size="sm" onClick={() => { setStatus(''); setPage(1); }}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card variant="elevated" padding="none">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="text" className="h-12" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6">
            <EmptyState icon={<AlertCircle />} title="Failed to load inspections" description="Check your connection and try again." />
          </div>
        ) : !data?.data.length ? (
          <div className="p-6">
            <EmptyState
              icon={<ShieldCheck />}
              title="No inspections found"
              description={status ? 'Try a different filter.' : 'Quality inspections appear here as production jobs complete.'}
              action={{ label: 'New Inspection', icon: <Plus className="w-4 h-4" />, onClick: () => setShowCreate(true) }}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-page-bg)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Inspection #</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Job ID</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Inspection Date</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Notes</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Result</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {data.data.map((inspection: QualityInspection) => (
                    <tr
                      key={inspection.id}
                      onClick={() => router.push(`/quality/${inspection.id}`)}
                      className="hover:bg-[var(--color-border-subtle)] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-primary)]">
                        {inspection.inspection_number || inspection.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">
                        {inspection.job_id ? inspection.job_id.slice(0, 8) + '…' : '—'}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {formatDate(inspection.inspected_at)}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)] max-w-[200px] truncate">
                        {inspection.notes || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <ResultIcon result={inspection.status} />
                          <span className="capitalize text-[var(--color-text-primary)]">
                            {inspection.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="status" status={
                          (['pending','approved','in_progress','completed','delivered','cancelled','rejected','paused','queued','running','blocked'].includes(inspection.status)
                            ? inspection.status as 'pending' | 'approved' | 'in_progress' | 'completed' | 'delivered' | 'cancelled' | 'rejected' | 'paused' | 'queued' | 'running' | 'blocked'
                            : 'pending')
                        } dot>
                          {inspection.status.replace(/_/g, ' ')}
                        </Badge>
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

      <CreateInspectionModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['quality'] })}
      />
    </div>
  );
}
