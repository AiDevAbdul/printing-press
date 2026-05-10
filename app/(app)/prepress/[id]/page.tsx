'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Layers, AlertCircle, Edit3, Check, X,
  User, Clock, Paperclip, MessageSquare, ExternalLink,
  CheckCircle2, XCircle, AlertTriangle, FileText,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui/Select';
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
  blister: 'Blister', other: 'Other',
};

const CATEGORY_LABELS: Record<string, string> = {
  pharmaceutical: 'Pharmaceutical', food: 'Food',
  cosmetic: 'Cosmetic', industrial: 'Industrial', other: 'Other',
};

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
  if (status === 'approved') return <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />;
  if (status === 'rejected') return <XCircle className="w-4 h-4 text-[var(--color-danger)]" />;
  return <AlertTriangle className="w-4 h-4 text-[var(--color-warning)]" />;
}

function ApprovalThread({ approvals }: { approvals: DesignApproval[] }) {
  if (!approvals.length) {
    return (
      <div className="text-sm text-[var(--color-text-tertiary)] py-6 text-center">
        No approval activity yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {approvals.map(a => (
        <div
          key={a.id}
          className={`flex gap-3 p-3 rounded-xl ${
            a.status === 'approved' ? 'bg-[var(--color-success-bg)]' :
            a.status === 'rejected' ? 'bg-[var(--color-danger-bg)]' :
            'bg-[var(--color-warning-bg)]'
          }`}
        >
          <div className="mt-0.5 flex-shrink-0">
            <ApprovalIcon status={a.status} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                {a.users?.full_name ?? 'Unknown'}
              </span>
              <Badge
                variant="status"
                status={a.status === 'approved' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending' as any}
              >
                {a.status.replace(/_/g, ' ')}
              </Badge>
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
      <div className="text-sm text-[var(--color-text-tertiary)] py-6 text-center">
        No attachments uploaded.
      </div>
    );
  }

  function fileIcon(type?: string) {
    if (!type) return <FileText className="w-4 h-4" />;
    if (type.startsWith('image/')) return <FileText className="w-4 h-4 text-[var(--color-info)]" />;
    if (type === 'application/pdf') return <FileText className="w-4 h-4 text-[var(--color-danger)]" />;
    return <Paperclip className="w-4 h-4" />;
  }

  return (
    <div className="space-y-2">
      {attachments.map(att => (
        <a
          key={att.id}
          href={att.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-page-bg)] transition-colors group"
        >
          <span className="text-[var(--color-text-tertiary)]">{fileIcon(att.file_type)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-brand)]">
              {att.file_name}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">{fmtDate(att.created_at)}</p>
          </div>
          <ExternalLink className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
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
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-48" />
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.push('/prepress')}
          className="mt-1 p-1.5 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] transition-colors"
          aria-label="Back to pre-press"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{design.name}</h1>
            {editStatus ? (
              <div className="flex items-center gap-2">
                <div className="w-44">
                  <Select
                    options={STATUS_OPTIONS}
                    value={newStatus || design.status}
                    onChange={e => setNewStatus(e.target.value)}
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
                <button onClick={() => setEditStatus(false)} className="p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-border-subtle)] rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => { setEditStatus(true); setNewStatus(design.status); }} className="group flex items-center gap-1.5">
                <Badge variant="status" status={design.status as any} dot>
                  {design.status.replace(/_/g, ' ')}
                </Badge>
                <Edit3 className="w-3 h-3 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-[var(--color-text-secondary)]">
            <span>{DESIGN_TYPE_LABELS[design.design_type] ?? design.design_type}</span>
            <span>·</span>
            <span>{CATEGORY_LABELS[design.product_category] ?? design.product_category}</span>
            {design.product_name && <><span>·</span><span>{design.product_name}</span></>}
          </div>
        </div>
      </div>

      {/* Meta cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Designer', value: design.users?.full_name ?? '—', icon: <User className="w-4 h-4" /> },
          { label: 'Created', value: fmtDate(design.created_at), icon: <Clock className="w-4 h-4" /> },
          { label: 'Last Updated', value: fmtDate(design.updated_at), icon: <Clock className="w-4 h-4" /> },
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

      {/* Notes */}
      {design.notes && (
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap">{design.notes}</p>
        </Card>
      )}

      {/* Spec / Approval sheet links */}
      {(design.specs_sheet_url || design.approval_sheet_url) && (
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--color-brand)]" />
              <CardTitle>Documents</CardTitle>
            </div>
          </CardHeader>
          <div className="flex flex-wrap gap-3">
            {design.specs_sheet_url && (
              <a
                href={design.specs_sheet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-brand)] hover:bg-[var(--color-brand-light)] transition-colors"
              >
                <FileText className="w-4 h-4" />
                Specifications Sheet
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {design.approval_sheet_url && (
              <a
                href={design.approval_sheet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-brand)] hover:bg-[var(--color-brand-light)] transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approval Sheet
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
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
  );
}
