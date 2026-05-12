'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, AlertCircle, Calendar, Package, FileText,
  User, Building2, Edit3, Check, X, Ruler, Palette, Download,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui/Select';
import { StatusPill, type StatusPillStatus } from '@/components/ui/StatusPill';
import { quotationsService, type Quotation } from '@/lib/services/quotations.service';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'converted', label: 'Converted to Order' },
];

function qStatusToPill(s: string): { status: StatusPillStatus; label: string } {
  switch (s) {
    case 'draft':     return { status: 'queued',     label: 'Draft' };
    case 'submitted': return { status: 'pending',    label: 'Submitted' };
    case 'approved':  return { status: 'approved',   label: 'Approved' };
    case 'rejected':  return { status: 'blocked',    label: 'Rejected' };
    case 'converted': return { status: 'completed',  label: 'Converted' };
    default:          return { status: 'queued',     label: s };
  }
}

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtCurrency(n?: number) {
  if (n === undefined || n === null) return '—';
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);
}

function SpecField({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-0.5">{label}</dt>
      <dd className="text-sm text-[var(--color-text-primary)]">{String(value)}</dd>
    </div>
  );
}

function SpecSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card variant="elevated" padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-brand)]">{icon}</span>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">{children}</dl>
    </Card>
  );
}

export default function QuotationDetail() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const [editStatus, setEditStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const { data: quotation, isLoading, error } = useQuery<Quotation>({
    queryKey: ['quotation', id],
    queryFn: () => quotationsService.getById(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Quotation>) => quotationsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotation', id] });
      qc.invalidateQueries({ queryKey: ['quotations'] });
      setEditStatus(false);
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl space-y-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
          <Skeleton variant="card" className="h-64" />
          <div className="space-y-4">
            <Skeleton variant="card" className="h-40" />
            <Skeleton variant="card" className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-10 h-10 text-[var(--color-danger)]" />
        <p className="text-[var(--color-text-secondary)]">Quotation not found.</p>
        <Button variant="ghost" onClick={() => router.push('/quotations')}>Back to Quotations</Button>
      </div>
    );
  }

  const pill = qStatusToPill(quotation.status);
  const isExpired = quotation.valid_until && new Date(quotation.valid_until) < new Date()
    && !['approved', 'converted', 'rejected'].includes(quotation.status);

  return (
    <div className="max-w-5xl space-y-5">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/quotations')}
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quotations
          </button>
          <span className="text-[var(--color-border)] text-sm">/</span>
          <span className="text-sm text-[var(--color-text-secondary)] font-mono">{quotation.quotation_number}</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.open(`/api/pdf/quotation/${id}`, '_blank')} className="flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Download PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 items-start">
        {/* ── Left sidebar ── */}
        <div className="space-y-4 lg:sticky lg:top-6">
          <Card variant="elevated" padding="none" className="overflow-hidden">
            <div className="h-1.5 w-full" style={{ background: 'var(--color-brand)' }} />
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-0.5">Quotation</p>
                <h1 className="text-xl font-bold font-mono text-[var(--color-text-primary)] tracking-tight">
                  {quotation.quotation_number}
                </h1>
                {quotation.version > 1 && (
                  <span className="text-xs text-[var(--color-text-tertiary)]">v{quotation.version}</span>
                )}
              </div>

              {/* Status */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1.5">Status</p>
                {editStatus ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Select options={STATUS_OPTIONS} value={newStatus || quotation.status} onChange={e => setNewStatus(e.target.value)} fullWidth />
                    </div>
                    <button
                      onClick={() => updateMutation.mutate({ status: newStatus || quotation.status })}
                      disabled={updateMutation.isPending}
                      className="p-1.5 rounded-md text-[var(--color-success)] hover:bg-[var(--color-success-bg)] transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditStatus(false)} className="p-1.5 rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-border-subtle)]">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setEditStatus(true); setNewStatus(quotation.status); }} className="group flex items-center gap-2">
                    <StatusPill status={pill.status} label={pill.label} />
                    <Edit3 className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>

              <div className="border-t border-[var(--color-border-subtle)]" />

              {/* Dates */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs">Quoted</span>
                  </div>
                  <span className="text-sm text-[var(--color-text-primary)]">{fmt(quotation.quotation_date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className={`text-xs ${isExpired ? 'text-[var(--color-danger)]' : ''}`}>Valid Until</span>
                  </div>
                  <span className={`text-sm font-medium ${isExpired ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-primary)]'}`}>
                    {fmt(quotation.valid_until)}
                    {isExpired && <span className="ml-1.5 text-[10px] opacity-75">Expired</span>}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
                    <Package className="w-3.5 h-3.5" />
                    <span className="text-xs">Quantity</span>
                  </div>
                  <span className="text-sm text-[var(--color-text-primary)]">
                    {quotation.quantity.toLocaleString()} <span className="text-[var(--color-text-tertiary)]">{quotation.unit}</span>
                  </span>
                </div>
              </div>

              {/* Amount */}
              {(quotation.total_amount || quotation.final_price) && (
                <>
                  <div className="border-t border-[var(--color-border-subtle)]" />
                  <div className="space-y-2">
                    {quotation.total_amount != null && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--color-text-tertiary)]">Total</span>
                        <span className="text-sm font-semibold text-[var(--color-text-primary)]">{fmtCurrency(quotation.total_amount)}</span>
                      </div>
                    )}
                    {quotation.final_price != null && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--color-text-tertiary)]">Final</span>
                        <span className="text-sm font-semibold text-[var(--color-brand)]">{fmtCurrency(quotation.final_price)}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Customer */}
          {quotation.customers && (
            <Card variant="elevated" padding="md">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-3">Customer</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <User className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">{quotation.customers.name}</span>
                </div>
                {quotation.customers.company_name && (
                  <div className="flex items-start gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[var(--color-text-secondary)]">{quotation.customers.company_name}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          <Button
            variant="secondary"
            fullWidth
            onClick={() => router.push('/orders/new')}
          >
            Convert to Order
          </Button>
        </div>

        {/* ── Right: specs ── */}
        <div className="space-y-4">
          <SpecSection title="Product" icon={<FileText className="w-4 h-4" />}>
            <SpecField label="Product Name" value={quotation.product_name} />
            <SpecField label="Product Type" value={quotation.product_type?.replace(/_/g, ' ')} />
            <SpecField label="Quantity" value={`${quotation.quantity.toLocaleString()} ${quotation.unit}`} />
            {quotation.special_instructions && (
              <div className="col-span-2 sm:col-span-3">
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1">Special Instructions</dt>
                <dd className="text-sm text-[var(--color-text-primary)] bg-[var(--color-warning-bg)] rounded-xl p-3 leading-relaxed">
                  {quotation.special_instructions}
                </dd>
              </div>
            )}
          </SpecSection>

          <SpecSection title="Dimensions & Material" icon={<Ruler className="w-4 h-4" />}>
            {(quotation.length || quotation.width) && (
              <SpecField
                label="Size"
                value={[quotation.length, quotation.width, quotation.height].filter(Boolean).join(' × ')
                  + (quotation.dimension_unit ? ` ${quotation.dimension_unit}` : '')}
              />
            )}
            <SpecField label="Paper Type" value={quotation.paper_type} />
            <SpecField label="GSM" value={quotation.gsm} />
          </SpecSection>

          <SpecSection title="Printing" icon={<Palette className="w-4 h-4" />}>
            <SpecField label="Colors Front" value={quotation.color_front} />
            <SpecField label="Colors Back" value={quotation.color_back} />
          </SpecSection>
        </div>
      </div>
    </div>
  );
}
