'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, AlertCircle, Edit3, Check, X,
  User, Clock, Paperclip, MessageSquare,
  ExternalLink, CheckCircle2, XCircle, AlertTriangle,
  FileText, Tag, Box,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui/Select';
import { StatusPill, type StatusPillStatus } from '@/components/ui/StatusPill';
import { prepressService, type Design, type DesignApproval, type DesignAttachment } from '@/lib/services/prepress.service';

const STATUS_OPTIONS = [
  { value: 'in_design', label: 'In Design' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'revision_required', label: 'Revision Required' },
];

const DESIGN_TYPE_LABELS: Record<string, string> = {
  label: 'Label', carton: 'Carton', leaflet: 'Leaflet',
  blister: 'Blister', other: 'Other', box: 'Box', logo: 'Logo', literature: 'Literature',
};

const CATEGORY_LABELS: Record<string, string> = {
  pharmaceutical: 'Pharmaceutical', food: 'Food',
  cosmetic: 'Cosmetic', industrial: 'Industrial',
  product: 'Product', commercial: 'Commercial',
  logo: 'Logo / Branding', other: 'Other',
};

const TYPE_PALETTE: Record<string, { bg: string; icon: string }> = {
  label:      { bg: '#EFF6FF', icon: '#3B82F6' },
  carton:     { bg: '#F0FDF4', icon: '#22C55E' },
  leaflet:    { bg: '#FAF5FF', icon: '#A855F7' },
  blister:    { bg: '#FFF7ED', icon: '#F97316' },
  box:        { bg: '#F0FDF4', icon: '#16A34A' },
  logo:       { bg: '#FFF1F2', icon: '#F43F5E' },
  literature: { bg: '#FAF5FF', icon: '#A855F7' },
  other:      { bg: '#F5F5F7', icon: '#8E8E93' },
};

function TypeIcon({ type, ...props }: { type: string } & React.SVGProps<SVGSVGElement>) {
  switch (type) {
    case 'carton':
    case 'box':        return <Box {...props as any} />;
    case 'leaflet':
    case 'literature': return <FileText {...props as any} />;
    default:           return <Tag {...props as any} />;
  }
}

function statusToPill(s: string): { status: StatusPillStatus; label: string } {
  switch (s) {
    case 'in_design':         return { status: 'in_progress', label: 'In Design' };
    case 'pending_approval':  return { status: 'pending',     label: 'Pending Approval' };
    case 'approved':          return { status: 'approved',    label: 'Approved' };
    case 'rejected':          return { status: 'blocked',     label: 'Rejected' };
    case 'revision_required': return { status: 'paused',      label: 'Revision Required' };
    default:                  return { status: 'queued',      label: s.replace(/_/g, ' ') };
  }
}

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ApprovalIcon({ status }: { status: string }) {
  if (status === 'approved') return <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] flex-shrink-0" />;
  if (status === 'rejected') return <XCircle className="w-4 h-4 text-[var(--color-danger)] flex-shrink-0" />;
  return <AlertTriangle className="w-4 h-4 text-[var(--color-warning)] flex-shrink-0" />;
}

function ApprovalThread({ approvals }: { approvals: DesignApproval[] }) {
  if (!approvals.length) {
    return (
      <div className="text-sm text-[var(--color-text-tertiary)] py-8 text-center">
        No approval activity yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {approvals.map((a) => (
        <div
          key={a.id}
          className={`flex gap-3 p-3 rounded-xl ${
            a.status === 'approved'
              ? 'bg-[var(--color-success-bg)]'
              : a.status === 'rejected'
              ? 'bg-[var(--color-danger-bg)]'
              : 'bg-[var(--color-warning-bg)]'
          }`}
        >
          <div className="mt-0.5">
            <ApprovalIcon status={a.status} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                {a.users?.full_name ?? 'Unknown'}
              </span>
              <StatusPill
                status={
                  a.status === 'approved' ? 'approved' :
                  a.status === 'rejected' ? 'blocked' : 'pending'
                }
                label={a.status.replace(/_/g, ' ')}
              />
            </div>
            {a.comments && (
              <p className="mt-1 text-sm text-[var(--color-text-primary)]">{a.comments}</p>
            )}
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{fmt(a.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AttachmentList({ attachments }: { attachments: DesignAttachment[] }) {
  if (!attachments.length) {
    return (
      <div className="text-sm text-[var(--color-text-tertiary)] py-8 text-center">
        No attachments uploaded.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {attachments.map((att) => (
        <a
          key={att.id}
          href={att.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--color-page-bg)] transition-colors group"
        >
          <FileText className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-brand)]">
              {att.file_name}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">{fmtDate(att.created_at)}</p>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </a>
      ))}
    </div>
  );
}

export default function PrepressDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const qc = useQueryClient();

  const [editStatus, setEditStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const { data: design, isLoading, error } = useQuery<Design>({
    queryKey: ['design', id],
    queryFn: () => prepressService.getById(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Design>) => prepressService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['design', id] });
      qc.invalidateQueries({ queryKey: ['prepress'] });
      setEditStatus(false);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton variant="card" className="h-56" />
            <Skeleton variant="card" className="h-24" />
          </div>
          <div className="lg:col-span-3">
            <Skeleton variant="card" className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-10 h-10 text-[var(--color-danger)]" />
        <p className="text-[var(--color-text-secondary)]">Design not found.</p>
        <Button variant="ghost" onClick={() => router.push('/prepress')}>Back to Pre-Press</Button>
      </div>
    );
  }

  const approvals = design.design_approvals ?? [];
  const attachments = design.design_attachments ?? [];
  const palette = TYPE_PALETTE[design.design_type] ?? TYPE_PALETTE.other;
  const pill = statusToPill(design.status);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + title bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/prepress')}
          className="p-1.5 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] transition-colors"
          aria-label="Back to pre-press"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)] truncate">{design.name}</h1>
      </div>

      {/* Split view */}
      <div className="grid lg:grid-cols-5 gap-5">

        {/* ─── Left panel ─── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Preview card */}
          <Card variant="elevated" padding="none" className="overflow-hidden">
            {/* Thumbnail */}
            <div
              className="h-44 flex items-center justify-center"
              style={{ backgroundColor: palette.bg }}
            >
              <TypeIcon
                type={design.design_type}
                className="w-16 h-16 opacity-[0.15]"
                style={{ color: palette.icon }}
                aria-hidden="true"
              />
            </div>
            {/* Design info */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--color-text-primary)] truncate">{design.name}</p>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                    {DESIGN_TYPE_LABELS[design.design_type] ?? design.design_type}
                    {design.product_category && (
                      <> · {CATEGORY_LABELS[design.product_category] ?? design.product_category}</>
                    )}
                  </p>
                  {design.product_name && (
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{design.product_name}</p>
                  )}
                </div>
                {editStatus ? (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-40">
                      <Select
                        options={STATUS_OPTIONS}
                        value={newStatus || design.status}
                        onChange={(e) => setNewStatus(e.target.value)}
                        fullWidth
                      />
                    </div>
                    <button
                      onClick={() => updateMutation.mutate({ status: newStatus || design.status })}
                      className="p-1 text-[var(--color-success)] hover:bg-[var(--color-success-bg)] rounded"
                      disabled={updateMutation.isPending}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditStatus(false)}
                      className="p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-border-subtle)] rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditStatus(true); setNewStatus(design.status); }}
                    className="group flex items-center gap-1 flex-shrink-0"
                  >
                    <StatusPill status={pill.status} label={pill.label} />
                    <Edit3 className="w-3 h-3 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>

              {/* Meta row */}
              <div className="pt-3 border-t border-[var(--color-border-subtle)] grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-1 text-[var(--color-text-tertiary)] mb-0.5">
                    <User className="w-3 h-3" />
                    <span>Designer</span>
                  </div>
                  <p className="font-medium text-[var(--color-text-primary)] truncate">
                    {design.users?.full_name ?? '—'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[var(--color-text-tertiary)] mb-0.5">
                    <Clock className="w-3 h-3" />
                    <span>Created</span>
                  </div>
                  <p className="font-medium text-[var(--color-text-primary)]">{fmtDate(design.created_at)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Document links */}
          {(design.specs_sheet_url || design.approval_sheet_url || design.notes) && (
            <Card variant="elevated" padding="lg">
              {(design.specs_sheet_url || design.approval_sheet_url) && (
                <>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[var(--color-brand)]" />
                      <CardTitle>Documents</CardTitle>
                    </div>
                  </CardHeader>
                  <div className="flex flex-col gap-2">
                    {design.specs_sheet_url && (
                      <a
                        href={design.specs_sheet_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-brand)] hover:bg-[var(--color-brand-light)] transition-colors"
                      >
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">Specifications Sheet</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    )}
                    {design.approval_sheet_url && (
                      <a
                        href={design.approval_sheet_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-brand)] hover:bg-[var(--color-brand-light)] transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">Approval Sheet</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    )}
                  </div>
                </>
              )}
              {design.notes && (
                <div className={design.specs_sheet_url || design.approval_sheet_url ? 'mt-4 pt-4 border-t border-[var(--color-border-subtle)]' : ''}>
                  <p className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide mb-2">Notes</p>
                  <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap">{design.notes}</p>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* ─── Right panel ─── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Approval thread */}
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[var(--color-brand)]" />
                  <CardTitle>Approval History</CardTitle>
                </div>
                {approvals.length > 0 && (
                  <span className="text-xs text-[var(--color-text-tertiary)]">{approvals.length} entries</span>
                )}
              </div>
            </CardHeader>
            <ApprovalThread approvals={approvals} />
          </Card>

          {/* Attachments */}
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-[var(--color-brand)]" />
                  <CardTitle>Attachments</CardTitle>
                </div>
                {attachments.length > 0 && (
                  <span className="text-xs text-[var(--color-text-tertiary)]">{attachments.length} files</span>
                )}
              </div>
            </CardHeader>
            <AttachmentList attachments={attachments} />
          </Card>
        </div>
      </div>
    </div>
  );
}
