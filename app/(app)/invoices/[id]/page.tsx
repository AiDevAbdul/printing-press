'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, AlertCircle, Calendar, FileText,
  User, Building2, Edit3, Check, X, DollarSign, Clock,
  Download, Plus, Trash2, CreditCard,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatusPill, type StatusPillStatus } from '@/components/ui/StatusPill';
import { invoicesService, type Invoice } from '@/lib/services/invoices.service';
import { paymentsService, type Payment } from '@/lib/services/payments.service';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

const METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'online', label: 'Online' },
];

function invStatusToPill(s: string): { status: StatusPillStatus; label: string } {
  switch (s) {
    case 'draft':     return { status: 'queued',     label: 'Draft' };
    case 'sent':      return { status: 'pending',    label: 'Sent' };
    case 'paid':      return { status: 'completed',  label: 'Paid' };
    case 'overdue':   return { status: 'blocked',    label: 'Overdue' };
    case 'cancelled': return { status: 'cancelled',  label: 'Cancelled' };
    default:          return { status: 'queued',     label: s };
  }
}

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtCurrency(n?: number | null) {
  if (n === undefined || n === null) return '—';
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);
}

function methodLabel(m: string) {
  const map: Record<string, string> = {
    cash: 'Cash', bank_transfer: 'Bank Transfer', cheque: 'Cheque', online: 'Online',
  };
  return map[m] || m;
}

function AmountRow({ label, value, highlight, green }: { label: string; value?: number | null; highlight?: boolean; green?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 ${highlight ? 'border-t border-[var(--color-border-subtle)] mt-1 pt-3' : ''}`}>
      <span className={`text-sm ${highlight ? 'font-semibold text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>{label}</span>
      <span className={`text-sm ${highlight ? 'font-bold text-[var(--color-brand)]' : green ? 'font-semibold text-emerald-600' : 'text-[var(--color-text-primary)]'}`}>
        {fmtCurrency(value)}
      </span>
    </div>
  );
}

function RecordPaymentModal({ invoiceId, balance, isOpen, onClose, onSuccess }: {
  invoiceId: string;
  balance: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState(String(balance > 0 ? balance : ''));
  const [method, setMethod] = useState('cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [ref, setRef] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => paymentsService.create({
      invoice_id: invoiceId,
      amount: Number(amount),
      payment_method: method,
      payment_date: date,
      reference_number: ref || undefined,
      notes: notes || undefined,
    }),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" size="sm">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
        )}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Amount (PKR)</label>
          <Input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder={`Max: ${balance}`}
            min={0.01}
            max={balance}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Payment Method</label>
          <Select options={METHOD_OPTIONS} value={method} onChange={e => setMethod(e.target.value)} fullWidth />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Payment Date</label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
            Reference / Cheque No. <span className="font-normal text-[var(--color-text-tertiary)]">(optional)</span>
          </label>
          <Input value={ref} onChange={e => setRef(e.target.value)} placeholder="TXN-12345" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
            Notes <span className="font-normal text-[var(--color-text-tertiary)]">(optional)</span>
          </label>
          <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any remarks…" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} fullWidth>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            isLoading={mutation.isPending}
            disabled={!amount || Number(amount) <= 0}
            fullWidth
          >
            Record Payment
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function InvoiceDetail() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const [editStatus, setEditStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);

  const { data: invoice, isLoading, error } = useQuery<Invoice>({
    queryKey: ['invoice', id],
    queryFn: () => invoicesService.getById(id),
  });

  const { data: payments = [], refetch: refetchPayments } = useQuery<Payment[]>({
    queryKey: ['payments', id],
    queryFn: () => paymentsService.getByInvoice(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Invoice>) => invoicesService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice', id] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      setEditStatus(false);
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => paymentsService.delete(paymentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice', id] });
      refetchPayments();
      setDeletingPaymentId(null);
    },
  });

  function handleDownloadPDF() {
    window.open(`/api/pdf/invoice/${id}`, '_blank');
  }

  function handlePaymentSuccess() {
    qc.invalidateQueries({ queryKey: ['invoice', id] });
    refetchPayments();
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl space-y-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
          <Skeleton variant="card" className="h-72" />
          <div className="space-y-4">
            <Skeleton variant="card" className="h-48" />
            <Skeleton variant="card" className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-10 h-10 text-[var(--color-danger)]" />
        <p className="text-[var(--color-text-secondary)]">Invoice not found.</p>
        <Button variant="ghost" onClick={() => router.push('/invoices')}>Back to Invoices</Button>
      </div>
    );
  }

  const pill = invStatusToPill(invoice.status);
  const isOverdue = invoice.status !== 'paid' && invoice.status !== 'cancelled'
    && invoice.due_date && new Date(invoice.due_date) < new Date();
  const paymentPct = invoice.total_amount > 0
    ? Math.min(100, Math.round((invoice.paid_amount / invoice.total_amount) * 100))
    : 0;
  const balance = Number(invoice.balance_amount ?? 0);

  return (
    <div className="max-w-5xl space-y-5">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/invoices')}
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Invoices
          </button>
          <span className="text-[var(--color-border)] text-sm">/</span>
          <span className="text-sm text-[var(--color-text-secondary)] font-mono">{invoice.invoice_number}</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="flex items-center gap-1.5">
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
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-0.5">Invoice</p>
                <h1 className="text-xl font-bold font-mono text-[var(--color-text-primary)] tracking-tight">
                  {invoice.invoice_number}
                </h1>
              </div>

              {/* Status */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1.5">Status</p>
                {editStatus ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Select options={STATUS_OPTIONS} value={newStatus || invoice.status} onChange={e => setNewStatus(e.target.value)} fullWidth />
                    </div>
                    <button
                      onClick={() => updateMutation.mutate({ status: newStatus || invoice.status })}
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
                  <button onClick={() => { setEditStatus(true); setNewStatus(invoice.status); }} className="group flex items-center gap-2">
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
                    <span className="text-xs">Invoice Date</span>
                  </div>
                  <span className="text-sm text-[var(--color-text-primary)]">{fmt(invoice.invoice_date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isOverdue
                      ? <Clock className="w-3.5 h-3.5 text-[var(--color-danger)]" />
                      : <Calendar className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />}
                    <span className={`text-xs ${isOverdue ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-tertiary)]'}`}>Due Date</span>
                  </div>
                  <span className={`text-sm font-medium ${isOverdue ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-primary)]'}`}>
                    {fmt(invoice.due_date)}
                    {isOverdue && <span className="ml-1.5 text-[10px] opacity-75">Overdue</span>}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Customer */}
          {invoice.customers && (
            <Card variant="elevated" padding="md">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-3">Customer</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <User className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">{invoice.customers.name}</span>
                </div>
                {invoice.customers.company_name && (
                  <div className="flex items-start gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[var(--color-text-secondary)]">{invoice.customers.company_name}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* ── Right: amounts + payments + details ── */}
        <div className="space-y-4">
          {/* Payment summary */}
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[var(--color-brand)]" />
                <CardTitle>Payment Summary</CardTitle>
              </div>
            </CardHeader>

            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-1.5">
                <span>{paymentPct}% paid</span>
                <span>{fmtCurrency(invoice.paid_amount)} of {fmtCurrency(invoice.total_amount)}</span>
              </div>
              <div className="h-2 bg-[var(--color-border-subtle)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${paymentPct}%`,
                    background: paymentPct >= 100 ? '#10b981' : 'var(--color-brand)',
                  }}
                />
              </div>
            </div>

            <div className="space-y-0.5">
              {invoice.subtotal != null && <AmountRow label="Subtotal" value={invoice.subtotal} />}
              {invoice.tax_amount != null && invoice.tax_amount > 0 && <AmountRow label="Tax" value={invoice.tax_amount} />}
              <AmountRow label="Total Amount" value={invoice.total_amount} highlight />
              {invoice.paid_amount != null && invoice.paid_amount > 0 && <AmountRow label="Paid Amount" value={invoice.paid_amount} green />}
              {balance > 0 && <AmountRow label="Balance Due" value={balance} />}
            </div>

            {invoice.status !== 'paid' && balance > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
                <Button fullWidth onClick={() => setShowPayModal(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Record Payment
                </Button>
              </div>
            )}
          </Card>

          {/* Payment History */}
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[var(--color-brand)]" />
                <CardTitle>Payment History</CardTitle>
              </div>
            </CardHeader>

            {payments.length === 0 ? (
              <p className="text-sm text-[var(--color-text-tertiary)] text-center py-6">No payments recorded yet.</p>
            ) : (
              <div className="divide-y divide-[var(--color-border-subtle)]">
                {payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-3 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-emerald-600">{fmtCurrency(p.amount)}</span>
                        <span className="text-[10px] bg-[var(--color-border-subtle)] text-[var(--color-text-secondary)] rounded px-1.5 py-0.5 font-medium">
                          {methodLabel(p.payment_method)}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">
                        {fmt(p.payment_date)}
                        {p.reference_number && <span className="ml-2">· Ref: {p.reference_number}</span>}
                        {p.users && <span className="ml-2">· {p.users.full_name}</span>}
                      </div>
                      {p.notes && <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 italic">{p.notes}</p>}
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Delete this payment? This will update the invoice balance.')) {
                          setDeletingPaymentId(p.id);
                          deletePaymentMutation.mutate(p.id);
                        }
                      }}
                      disabled={deletingPaymentId === p.id}
                      className="p-1.5 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Description */}
          {invoice.description && (
            <Card variant="elevated" padding="lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--color-brand)]" />
                  <CardTitle>Description</CardTitle>
                </div>
              </CardHeader>
              <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{invoice.description}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        invoiceId={id}
        balance={balance}
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
