'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, FileText, Calendar, Package, Printer,
  Layers, AlertCircle, Edit3, Check, X, ExternalLink,
  RotateCcw, Ruler, Palette, Sparkles, ClipboardList,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui/Select';
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

function Field({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === '' || value === false) return null;
  const display = typeof value === 'boolean' ? 'Yes' : String(value);
  return (
    <div>
      <dt className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="text-sm text-[var(--color-text-primary)]">{display}</dd>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card variant="elevated" padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-brand)]">{icon}</span>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
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
      <div className="space-y-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-48" />
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

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.push('/orders')}
          className="mt-1 p-1.5 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] transition-colors"
          aria-label="Back to orders"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] font-mono">
              {order.order_number}
            </h1>
            {/* Status badge + inline edit */}
            {editStatus ? (
              <div className="flex items-center gap-2">
                <div className="w-36">
                  <Select
                    options={STATUS_OPTIONS}
                    value={newStatus || order.status}
                    onChange={e => setNewStatus(e.target.value)}
                    fullWidth
                  />
                </div>
                <button
                  onClick={() => updateMutation.mutate({ status: newStatus as Order['status'] || order.status as Order['status'] })}
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
              <button onClick={() => { setEditStatus(true); setNewStatus(order.status); }} className="group flex items-center gap-1.5">
                <Badge variant="status" status={order.status as any} dot>
                  {order.status.replace(/_/g, ' ')}
                </Badge>
                <Edit3 className="w-3 h-3 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
            {/* Priority badge + inline edit */}
            {editPriority ? (
              <div className="flex items-center gap-2">
                <div className="w-28">
                  <Select
                    options={PRIORITY_OPTIONS}
                    value={newPriority || order.priority}
                    onChange={e => setNewPriority(e.target.value)}
                    fullWidth
                  />
                </div>
                <button
                  onClick={() => updateMutation.mutate({ priority: newPriority as Order['priority'] || order.priority as Order['priority'] })}
                  className="p-1 text-[var(--color-success)] hover:bg-[var(--color-success-bg)] rounded"
                  disabled={updateMutation.isPending}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditPriority(false)} className="p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-border-subtle)] rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => { setEditPriority(true); setNewPriority(order.priority); }} className="group flex items-center gap-1.5">
                <Badge variant="priority" priority={order.priority as any} dot>
                  {order.priority}
                </Badge>
                <Edit3 className="w-3 h-3 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
            {order.is_repeat_order && (
              <Badge variant="info" dot={false}>
                <RotateCcw className="w-3 h-3 mr-1" />Repeat Order
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-[var(--color-text-secondary)]">
            <span>{order.customers?.name}</span>
            {order.customers?.company_name && <span>· {order.customers.company_name}</span>}
            <span>· Ordered {fmt(order.order_date)}</span>
          </div>
        </div>
      </div>

      {/* Key metrics strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Delivery Date',
            value: fmt(order.delivery_date),
            sub: overdue ? 'Overdue' : undefined,
            danger: overdue,
            icon: <Calendar className="w-4 h-4" />,
          },
          {
            label: 'Quantity',
            value: `${order.quantity.toLocaleString()} ${order.unit}`,
            icon: <Package className="w-4 h-4" />,
          },
          {
            label: 'Quoted Price',
            value: fmtCurrency(order.quoted_price),
            icon: <FileText className="w-4 h-4" />,
          },
          {
            label: 'Final Price',
            value: fmtCurrency(order.final_price),
            icon: <FileText className="w-4 h-4" />,
          },
        ].map(m => (
          <Card key={m.label} variant="elevated" padding="md">
            <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] mb-1">
              {m.icon}
              <span className="text-xs font-medium uppercase tracking-wide">{m.label}</span>
            </div>
            <div className={`text-lg font-semibold ${m.danger ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-primary)]'}`}>
              {m.value}
            </div>
            {m.sub && <div className="text-xs text-[var(--color-danger)] mt-0.5">{m.sub}</div>}
          </Card>
        ))}
      </div>

      {/* Product Basics */}
      <Section title="Product" icon={<ClipboardList className="w-4 h-4" />}>
        <Field label="Product Name" value={order.product_name} />
        <Field label="Product Type" value={order.product_type?.replace(/_/g, ' ')} />
        <Field label="Quantity" value={`${order.quantity.toLocaleString()} ${order.unit}`} />
        <Field label="Group / Batch" value={order.group_name} />
        <Field label="Batch Number" value={order.batch_number} />
        <Field label="Specifications" value={order.specifications} />
        {order.special_instructions && (
          <div className="col-span-2 sm:col-span-3">
            <dt className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide mb-0.5">Special Instructions</dt>
            <dd className="text-sm text-[var(--color-text-primary)] bg-[var(--color-page-bg)] rounded-md p-3">{order.special_instructions}</dd>
          </div>
        )}
      </Section>

      {/* Size & Material */}
      <Section title="Size & Material" icon={<Ruler className="w-4 h-4" />}>
        <Field label="Substrate" value={order.substrate} />
        <Field label="GSM" value={order.gsm} />
        {(order.size_length || order.size_width) && (
          <Field label="Size" value={[order.size_length, order.size_width].filter(Boolean).join(' × ') + (order.size_unit ? ` ${order.size_unit}` : '')} />
        )}
        <Field label="Finishing" value={order.finishing_requirements} />
        <Field label="Back Printing" value={order.has_back_printing} />
        <Field label="Barcode" value={order.has_barcode} />
      </Section>

      {/* Printing */}
      <Section title="Printing" icon={<Printer className="w-4 h-4" />}>
        <Field label="Printing Type" value={order.printing_type?.replace(/_/g, ' ')} />
        <Field label="Colors" value={order.colors} />
        <Field label="Color 1" value={order.color_p1} />
        <Field label="Color 2" value={order.color_p2} />
        <Field label="Color 3" value={order.color_p3} />
        <Field label="Color 4" value={order.color_p4} />
      </Section>

      {/* Finishing */}
      <Section title="Finishing" icon={<Sparkles className="w-4 h-4" />}>
        <Field label="Lamination" value={order.lamination_type?.replace(/_/g, ' ')} />
        <Field label="Lamination Size" value={(order as any).lamination_size} />
        <Field label="Varnish Type" value={order.varnish_type?.replace(/_/g, ' ')} />
        <Field label="Varnish Details" value={order.varnish_details} />
        <Field label="UV / Emboss" value={order.uv_emboss_details} />
        <Field label="Die Type" value={order.die_type?.replace(/_/g, ' ')} />
        <Field label="Die Reference" value={order.die_reference} />
        <Field label="Emboss Film" value={(order as any).emboss_film_details} />
      </Section>

      {/* Pre-Press / Design */}
      <Section title="Pre-Press / Design" icon={<Layers className="w-4 h-4" />}>
        <Field label="Designer" value={order.designer_name} />
        <Field label="Approved By" value={order.design_approved_by} />
        <Field label="Approved At" value={fmt((order as any).design_approved_at)} />
        <Field label="Plate Reference" value={order.plate_reference} />
        <Field label="No. of Plates" value={order.number_of_plates} />
        <Field label="Plate Size" value={order.plate_size} />
        <Field label="Cylinder Reference" value={(order as any).cylinder_reference} />
        <Field label="CTP Info" value={(order as any).ctp_info} />
        <Field label="Color Matching" value={(order as any).color_matching_standard?.replace(/_/g, ' ')} />
      </Section>

      {/* Colour palette preview if any colours filled */}
      {(order.color_p1 || order.color_p2 || order.color_p3 || order.color_p4) && (
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[var(--color-brand)]" />
              <CardTitle>Colour Breakdown</CardTitle>
            </div>
          </CardHeader>
          <div className="flex flex-wrap gap-3">
            {[order.color_p1, order.color_p2, order.color_p3, order.color_p4].filter(Boolean).map((c, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-page-bg)] text-sm text-[var(--color-text-primary)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-brand)]" />
                {c}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
