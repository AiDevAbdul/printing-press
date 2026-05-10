'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Calendar, Package, FileText,
  Printer, Layers, Sparkles, ClipboardList, Ruler,
  AlertCircle, Edit3, Check, X, RotateCcw, User,
  Building2, Phone, Mail, Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui/Select';
import { StatusPill, type StatusPillStatus } from '@/components/ui/StatusPill';
import { ordersService, type Order } from '@/lib/services/orders.service';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'in_production', label: 'In Production' },
  { value: 'completed', label: 'Completed' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const PRIORITY_DOT: Record<string, string> = {
  urgent: 'var(--color-danger)',
  high:   'var(--color-warning)',
  normal: 'var(--color-info)',
  low:    'var(--color-text-tertiary)',
};

function orderStatusToPill(s: string): { status: StatusPillStatus; label: string } {
  switch (s) {
    case 'pending':       return { status: 'pending',     label: 'Pending' };
    case 'approved':      return { status: 'approved',    label: 'Approved' };
    case 'in_production': return { status: 'in_progress', label: 'In Production' };
    case 'completed':     return { status: 'completed',   label: 'Completed' };
    case 'delivered':     return { status: 'completed',   label: 'Delivered' };
    case 'cancelled':     return { status: 'cancelled',   label: 'Cancelled' };
    default:              return { status: 'queued',      label: s.replace(/_/g, ' ') };
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

function isOverdue(date: string, status: string) {
  if (['delivered', 'completed', 'cancelled'].includes(status)) return false;
  return new Date(date) < new Date();
}

function SpecField({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === '' || value === false) return null;
  const display = typeof value === 'boolean' ? 'Yes' : String(value);
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-0.5">{label}</dt>
      <dd className="text-sm text-[var(--color-text-primary)]">{display}</dd>
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
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
        {children}
      </dl>
    </Card>
  );
}

export default function OrderDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const qc = useQueryClient();

  const [editStatus, setEditStatus] = useState(false);
  const [editPriority, setEditPriority] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => ordersService.getById(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Order>) => ordersService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      setEditStatus(false);
      setEditPriority(false);
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl space-y-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          <div className="space-y-4">
            <Skeleton variant="card" className="h-56" />
            <Skeleton variant="card" className="h-40" />
          </div>
          <div className="space-y-4">
            <Skeleton variant="card" className="h-40" />
            <Skeleton variant="card" className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-10 h-10 text-[var(--color-danger)]" />
        <p className="text-[var(--color-text-secondary)]">Order not found.</p>
        <Button variant="ghost" onClick={() => router.push('/orders')}>Back to Orders</Button>
      </div>
    );
  }

  const overdue = isOverdue(order.delivery_date, order.status);
  const pill = orderStatusToPill(order.status);

  const hasColours = order.color_p1 || order.color_p2 || order.color_p3 || order.color_p4;

  return (
    <div className="max-w-6xl space-y-5">
      {/* Breadcrumb nav */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push('/orders')}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          aria-label="Back to orders"
        >
          <ArrowLeft className="w-4 h-4" />
          Orders
        </button>
        <span className="text-[var(--color-border)] text-sm">/</span>
        <span className="text-sm text-[var(--color-text-secondary)] font-mono">{order.order_number}</span>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 items-start">

        {/* ── Left sidebar ── */}
        <div className="space-y-4 lg:sticky lg:top-6">

          {/* Identity card */}
          <Card variant="elevated" padding="none" className="overflow-hidden">
            {/* Coloured band */}
            <div className="h-1.5 w-full" style={{ background: 'var(--color-brand)' }} />

            <div className="p-5 space-y-4">
              {/* Order # + repeat badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-0.5">Order</p>
                  <h1 className="text-xl font-bold font-mono text-[var(--color-text-primary)] tracking-tight">
                    {order.order_number}
                  </h1>
                </div>
                {order.is_repeat_order && (
                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-[var(--color-border-subtle)] text-[var(--color-text-tertiary)]">
                    <RotateCcw className="w-3 h-3" /> Repeat
                  </span>
                )}
              </div>

              {/* Status */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1.5">Status</p>
                {editStatus ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Select
                        options={STATUS_OPTIONS}
                        value={newStatus || order.status}
                        onChange={e => setNewStatus(e.target.value)}
                        fullWidth
                      />
                    </div>
                    <button
                      onClick={() => updateMutation.mutate({ status: (newStatus || order.status) as Order['status'] })}
                      disabled={updateMutation.isPending}
                      className="p-1.5 rounded-md text-[var(--color-success)] hover:bg-[var(--color-success-bg)] transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditStatus(false)}
                      className="p-1.5 rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-border-subtle)] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditStatus(true); setNewStatus(order.status); }}
                    className="group flex items-center gap-2"
                  >
                    <StatusPill status={pill.status} label={pill.label} />
                    <Edit3 className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>

              {/* Priority */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1.5">Priority</p>
                {editPriority ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Select
                        options={PRIORITY_OPTIONS}
                        value={newPriority || order.priority}
                        onChange={e => setNewPriority(e.target.value)}
                        fullWidth
                      />
                    </div>
                    <button
                      onClick={() => updateMutation.mutate({ priority: (newPriority || order.priority) as Order['priority'] })}
                      disabled={updateMutation.isPending}
                      className="p-1.5 rounded-md text-[var(--color-success)] hover:bg-[var(--color-success-bg)] transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditPriority(false)}
                      className="p-1.5 rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-border-subtle)] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditPriority(true); setNewPriority(order.priority); }}
                    className="group flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--color-page-bg)]">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PRIORITY_DOT[order.priority] ?? PRIORITY_DOT.normal }}
                      />
                      <span className="text-sm capitalize text-[var(--color-text-primary)]">{order.priority}</span>
                    </div>
                    <Edit3 className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>

              <div className="border-t border-[var(--color-border-subtle)]" />

              {/* Key dates + quantity */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs">Ordered</span>
                  </div>
                  <span className="text-sm text-[var(--color-text-primary)]">{fmt(order.order_date)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
                    {overdue
                      ? <Clock className="w-3.5 h-3.5 text-[var(--color-danger)]" />
                      : <Calendar className="w-3.5 h-3.5" />}
                    <span className={`text-xs ${overdue ? 'text-[var(--color-danger)]' : ''}`}>Delivery</span>
                  </div>
                  <span className={`text-sm font-medium ${overdue ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-primary)]'}`}>
                    {fmt(order.delivery_date)}
                    {overdue && <span className="ml-1.5 text-[10px] uppercase tracking-wide opacity-75">Overdue</span>}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
                    <Package className="w-3.5 h-3.5" />
                    <span className="text-xs">Quantity</span>
                  </div>
                  <span className="text-sm text-[var(--color-text-primary)]">
                    {order.quantity.toLocaleString()} <span className="text-[var(--color-text-tertiary)]">{order.unit}</span>
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing card */}
          {(order.quoted_price || order.final_price) && (
            <Card variant="elevated" padding="md">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-3">Pricing</p>
              <div className="space-y-2.5">
                {order.quoted_price != null && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="text-xs">Quoted</span>
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">{fmtCurrency(order.quoted_price)}</span>
                  </div>
                )}
                {order.final_price != null && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="text-xs">Final</span>
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-brand)]">{fmtCurrency(order.final_price)}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Customer card */}
          {order.customers && (
            <Card variant="elevated" padding="md">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-3">Customer</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <User className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">{order.customers.name}</span>
                </div>
                {order.customers.company_name && (
                  <div className="flex items-start gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[var(--color-text-secondary)]">{order.customers.company_name}</span>
                  </div>
                )}
                {(order.customers as any).phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[var(--color-text-secondary)]">{(order.customers as any).phone}</span>
                  </div>
                )}
                {(order.customers as any).email && (
                  <div className="flex items-start gap-2">
                    <Mail className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[var(--color-text-secondary)]">{(order.customers as any).email}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* ── Right: spec sections ── */}
        <div className="space-y-4">

          <SpecSection title="Product" icon={<ClipboardList className="w-4 h-4" />}>
            <SpecField label="Product Name" value={order.product_name} />
            <SpecField label="Product Type" value={order.product_type?.replace(/_/g, ' ')} />
            <SpecField label="Group / Batch" value={order.group_name} />
            <SpecField label="Batch Number" value={order.batch_number} />
            {order.specifications && (
              <div className="col-span-2 sm:col-span-3">
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1">Specifications</dt>
                <dd className="text-sm text-[var(--color-text-primary)] bg-[var(--color-page-bg)] rounded-xl p-3 leading-relaxed">
                  {order.specifications}
                </dd>
              </div>
            )}
            {order.special_instructions && (
              <div className="col-span-2 sm:col-span-3">
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1">Special Instructions</dt>
                <dd className="text-sm text-[var(--color-text-primary)] bg-[var(--color-warning-bg)] rounded-xl p-3 leading-relaxed border border-[var(--color-warning)] border-opacity-20">
                  {order.special_instructions}
                </dd>
              </div>
            )}
          </SpecSection>

          <SpecSection title="Size & Material" icon={<Ruler className="w-4 h-4" />}>
            <SpecField label="Substrate" value={order.substrate} />
            <SpecField label="GSM" value={order.gsm} />
            {(order.size_length || order.size_width) && (
              <SpecField
                label="Size"
                value={[order.size_length, order.size_width].filter(Boolean).join(' × ') + (order.size_unit ? ` ${order.size_unit}` : '')}
              />
            )}
            <SpecField label="Card Size" value={(order as any).card_size} />
            <SpecField label="Finishing" value={order.finishing_requirements} />
            <SpecField label="Back Printing" value={order.has_back_printing} />
            <SpecField label="Barcode" value={order.has_barcode} />
          </SpecSection>

          <SpecSection title="Printing" icon={<Printer className="w-4 h-4" />}>
            <SpecField label="Printing Type" value={order.printing_type?.replace(/_/g, ' ')} />
            <SpecField label="Colors" value={order.colors} />
            <SpecField label="Color 1" value={order.color_p1} />
            <SpecField label="Color 2" value={order.color_p2} />
            <SpecField label="Color 3" value={order.color_p3} />
            <SpecField label="Color 4" value={order.color_p4} />
          </SpecSection>

          {hasColours && (
            <Card variant="elevated" padding="md">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[var(--color-brand)]"><Printer className="w-4 h-4" /></span>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">Colour Breakdown</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[order.color_p1, order.color_p2, order.color_p3, order.color_p4].filter(Boolean).map((c, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-page-bg)] border border-[var(--color-border-subtle)]">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-brand)' }} />
                    <span className="text-sm text-[var(--color-text-primary)]">{c}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <SpecSection title="Finishing" icon={<Sparkles className="w-4 h-4" />}>
            <SpecField label="Lamination" value={order.lamination_type?.replace(/_/g, ' ')} />
            <SpecField label="Lamination Size" value={(order as any).lamination_size} />
            <SpecField label="Varnish Type" value={order.varnish_type?.replace(/_/g, ' ')} />
            <SpecField label="Varnish Details" value={order.varnish_details} />
            <SpecField label="UV / Emboss" value={order.uv_emboss_details} />
            <SpecField label="Die Type" value={order.die_type?.replace(/_/g, ' ')} />
            <SpecField label="Die Reference" value={order.die_reference} />
            <SpecField label="Emboss Film" value={(order as any).emboss_film_details} />
          </SpecSection>

          <SpecSection title="Pre-Press / Design" icon={<Layers className="w-4 h-4" />}>
            <SpecField label="Designer" value={order.designer_name} />
            <SpecField label="Approved By" value={order.design_approved_by} />
            <SpecField label="Approved At" value={fmt((order as any).design_approved_at)} />
            <SpecField label="Plate Reference" value={order.plate_reference} />
            <SpecField label="No. of Plates" value={order.number_of_plates} />
            <SpecField label="Plate Size" value={order.plate_size} />
            <SpecField label="Cylinder Reference" value={(order as any).cylinder_reference} />
            <SpecField label="CTP Info" value={(order as any).ctp_info} />
            <SpecField label="Color Matching" value={(order as any).color_matching_standard?.replace(/_/g, ' ')} />
          </SpecSection>

        </div>
      </div>
    </div>
  );
}
