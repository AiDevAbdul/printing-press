'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { invoicesService, type Invoice } from '@/lib/services/invoices.service';
import { customersService } from '@/lib/services/customers.service';
import { ordersService } from '@/lib/services/orders.service';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
];

type FormData = {
  customer_id: string;
  order_id: string;
  invoice_date: string;
  due_date: string;
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  description: string;
  status: string;
};

const today = new Date().toISOString().split('T')[0];
const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

const EMPTY: FormData = {
  customer_id: '', order_id: '',
  invoice_date: today, due_date: dueDate,
  subtotal: '', tax_amount: '0', total_amount: '',
  description: '', status: 'draft',
};

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1.5">
      {text}{required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
    </label>
  );
}

function Divider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">{title}</span>
      <div className="flex-1 h-px bg-[var(--color-border-subtle)]" />
    </div>
  );
}

export default function NewInvoice() {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (k: keyof FormData, v: string) => {
    setForm(f => {
      const next = { ...f, [k]: v };
      // Auto-compute total when subtotal or tax changes
      if (k === 'subtotal' || k === 'tax_amount') {
        const sub = parseFloat(k === 'subtotal' ? v : next.subtotal) || 0;
        const tax = parseFloat(k === 'tax_amount' ? v : next.tax_amount) || 0;
        next.total_amount = String(sub + tax);
      }
      return next;
    });
  };

  const { data: customersData } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => customersService.getAll({ limit: 200, is_active: true }),
  });

  const { data: ordersData } = useQuery({
    queryKey: ['orders-all'],
    queryFn: () => ordersService.getAll({ limit: 200 }),
  });

  const customerOptions = [
    { value: '', label: 'Select customer...' },
    ...(customersData?.data ?? []).map(c => ({
      value: c.id,
      label: c.company_name ? `${c.name} — ${c.company_name}` : c.name,
    })),
  ];

  const orderOptions = [
    { value: '', label: 'None (standalone invoice)' },
    ...(ordersData?.data ?? []).map(o => ({
      value: o.id,
      label: `${o.order_number} — ${o.product_name}`,
    })),
  ];

  const mutation = useMutation({
    mutationFn: (data: Partial<Invoice>) => invoicesService.create(data),
    onSuccess: (inv) => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      router.push(`/invoices/${inv.id}`);
    },
  });

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.customer_id) e.customer_id = 'Required';
    if (!form.total_amount || parseFloat(form.total_amount) <= 0) e.total_amount = 'Must be > 0';
    if (!form.due_date) e.due_date = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const payload: Partial<Invoice> = {
      customer_id: form.customer_id,
      invoice_date: new Date(form.invoice_date).toISOString(),
      due_date: new Date(form.due_date).toISOString(),
      total_amount: parseFloat(form.total_amount),
      status: form.status as Invoice['status'],
    };
    if (form.order_id) payload.order_id = form.order_id;
    if (form.subtotal) payload.subtotal = parseFloat(form.subtotal);
    if (form.tax_amount) payload.tax_amount = parseFloat(form.tax_amount) || 0;
    if (form.description) payload.description = form.description;
    mutation.mutate(payload);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/invoices')}
          className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">New Invoice</h1>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Create a new invoice for a customer</p>
        </div>
      </div>

      <Card variant="elevated" padding="lg">
        <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
        <div className="space-y-4">
          <div>
            <Label text="Customer" required />
            <Select options={customerOptions} value={form.customer_id} onChange={e => set('customer_id', e.target.value)} fullWidth />
            {errors.customer_id && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.customer_id}</p>}
          </div>

          <div>
            <Label text="Linked Order (optional)" />
            <Select options={orderOptions} value={form.order_id} onChange={e => set('order_id', e.target.value)} fullWidth />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label text="Invoice Date" />
              <Input type="date" value={form.invoice_date} onChange={e => set('invoice_date', e.target.value)} fullWidth />
            </div>
            <div>
              <Label text="Due Date" required />
              <Input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} fullWidth error={errors.due_date} />
            </div>
          </div>

          <div>
            <Label text="Status" />
            <Select options={STATUS_OPTIONS} value={form.status} onChange={e => set('status', e.target.value)} fullWidth />
          </div>

          <Divider title="Amounts" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label text="Subtotal (PKR)" />
              <Input type="number" value={form.subtotal} onChange={e => set('subtotal', e.target.value)} placeholder="0" fullWidth />
            </div>
            <div>
              <Label text="Tax (PKR)" />
              <Input type="number" value={form.tax_amount} onChange={e => set('tax_amount', e.target.value)} placeholder="0" fullWidth />
            </div>
            <div>
              <Label text="Total (PKR)" required />
              <Input type="number" value={form.total_amount} onChange={e => set('total_amount', e.target.value)} placeholder="0" fullWidth error={errors.total_amount} />
            </div>
          </div>

          <div>
            <Label text="Description / Notes" />
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              placeholder="Optional invoice description..."
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-none transition"
            />
          </div>

          {mutation.isError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Failed to create invoice. Please try again.
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-[var(--color-border-subtle)]">
            <Button onClick={handleSubmit} isLoading={mutation.isPending}>Create Invoice</Button>
            <Button variant="ghost" onClick={() => router.push('/invoices')}>Cancel</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
