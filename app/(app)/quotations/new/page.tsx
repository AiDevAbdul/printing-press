'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { quotationsService, type Quotation } from '@/lib/services/quotations.service';
import { customersService } from '@/lib/services/customers.service';

const PRODUCT_TYPE_OPTIONS = [
  { value: 'cpp_carton', label: 'CPP Carton' },
  { value: 'silvo_blister', label: 'Silvo Blister' },
  { value: 'bent_foil', label: 'Bent Foil' },
  { value: 'alu_alu', label: 'Alu-Alu' },
];

const UNIT_OPTIONS = [
  { value: 'pcs', label: 'Pieces' },
  { value: 'sheets', label: 'Sheets' },
  { value: 'rolls', label: 'Rolls' },
  { value: 'kg', label: 'KG' },
];

type FormData = {
  customer_id: string;
  quotation_date: string;
  valid_until: string;
  product_name: string;
  product_type: string;
  quantity: string;
  unit: string;
  length: string;
  width: string;
  height: string;
  dimension_unit: string;
  paper_type: string;
  gsm: string;
  color_front: string;
  color_back: string;
  special_instructions: string;
};

const today = new Date().toISOString().split('T')[0];
const thirtyDays = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

const EMPTY: FormData = {
  customer_id: '', quotation_date: today, valid_until: thirtyDays,
  product_name: '', product_type: 'cpp_carton',
  quantity: '1', unit: 'pcs',
  length: '', width: '', height: '', dimension_unit: 'mm',
  paper_type: '', gsm: '', color_front: '4', color_back: '0',
  special_instructions: '',
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

export default function NewQuotation() {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

  const { data: customersData } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => customersService.getAll({ limit: 200, is_active: true }),
  });

  const customerOptions = [
    { value: '', label: 'Select customer...' },
    ...(customersData?.data ?? []).map(c => ({
      value: c.id,
      label: c.company_name ? `${c.name} — ${c.company_name}` : c.name,
    })),
  ];

  const mutation = useMutation({
    mutationFn: (data: Partial<Quotation>) => quotationsService.create(data),
    onSuccess: (q) => {
      qc.invalidateQueries({ queryKey: ['quotations'] });
      router.push(`/quotations/${q.id}`);
    },
  });

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.customer_id) e.customer_id = 'Required';
    if (!form.product_name.trim()) e.product_name = 'Required';
    if (!form.quantity || parseInt(form.quantity) < 1) e.quantity = 'Must be ≥ 1';
    if (!form.valid_until) e.valid_until = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const payload: Partial<Quotation> = {
      customer_id: form.customer_id,
      quotation_date: new Date(form.quotation_date).toISOString(),
      valid_until: new Date(form.valid_until).toISOString(),
      product_name: form.product_name,
      product_type: form.product_type,
      quantity: parseInt(form.quantity),
      unit: form.unit,
      color_front: parseInt(form.color_front) || 0,
      color_back: parseInt(form.color_back) || 0,
    };
    if (form.length) payload.length = parseFloat(form.length);
    if (form.width) payload.width = parseFloat(form.width);
    if (form.height) payload.height = parseFloat(form.height);
    if (form.dimension_unit) payload.dimension_unit = form.dimension_unit;
    if (form.paper_type) payload.paper_type = form.paper_type;
    if (form.gsm) payload.gsm = parseFloat(form.gsm);
    if (form.special_instructions) payload.special_instructions = form.special_instructions;
    mutation.mutate(payload);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/quotations')}
          className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">New Quotation</h1>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Create a price quotation for a customer</p>
        </div>
      </div>

      <Card variant="elevated" padding="lg">
        <CardHeader><CardTitle>Quotation Details</CardTitle></CardHeader>
        <div className="space-y-4">
          <div>
            <Label text="Customer" required />
            <Select options={customerOptions} value={form.customer_id} onChange={e => set('customer_id', e.target.value)} fullWidth />
            {errors.customer_id && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.customer_id}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label text="Quotation Date" />
              <Input type="date" value={form.quotation_date} onChange={e => set('quotation_date', e.target.value)} fullWidth />
            </div>
            <div>
              <Label text="Valid Until" required />
              <Input type="date" value={form.valid_until} onChange={e => set('valid_until', e.target.value)} fullWidth error={errors.valid_until} />
            </div>
          </div>

          <Divider title="Product" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label text="Product Name" required />
              <Input value={form.product_name} onChange={e => set('product_name', e.target.value)} placeholder="e.g. Amoxicillin 500mg Carton" fullWidth error={errors.product_name} />
            </div>
            <div>
              <Label text="Product Type" />
              <Select options={PRODUCT_TYPE_OPTIONS} value={form.product_type} onChange={e => set('product_type', e.target.value)} fullWidth />
            </div>
            <div>
              <Label text="Quantity" required />
              <Input type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} fullWidth error={errors.quantity} />
            </div>
            <div>
              <Label text="Unit" />
              <Select options={UNIT_OPTIONS} value={form.unit} onChange={e => set('unit', e.target.value)} fullWidth />
            </div>
          </div>

          <Divider title="Dimensions & Material" />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label text="Length" />
              <Input type="number" value={form.length} onChange={e => set('length', e.target.value)} placeholder="0.00" fullWidth />
            </div>
            <div>
              <Label text="Width" />
              <Input type="number" value={form.width} onChange={e => set('width', e.target.value)} placeholder="0.00" fullWidth />
            </div>
            <div>
              <Label text="Unit" />
              <Select options={[{ value: 'mm', label: 'mm' }, { value: 'cm', label: 'cm' }, { value: 'inch', label: 'inch' }]} value={form.dimension_unit} onChange={e => set('dimension_unit', e.target.value)} fullWidth />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label text="Paper Type" />
              <Input value={form.paper_type} onChange={e => set('paper_type', e.target.value)} placeholder="e.g. Art Paper, Duplex" fullWidth />
            </div>
            <div>
              <Label text="GSM" />
              <Input type="number" value={form.gsm} onChange={e => set('gsm', e.target.value)} placeholder="e.g. 350" fullWidth />
            </div>
          </div>

          <Divider title="Printing" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label text="Colors Front" />
              <Input type="number" min="0" value={form.color_front} onChange={e => set('color_front', e.target.value)} fullWidth />
            </div>
            <div>
              <Label text="Colors Back" />
              <Input type="number" min="0" value={form.color_back} onChange={e => set('color_back', e.target.value)} fullWidth />
            </div>
          </div>

          <div>
            <Label text="Special Instructions" />
            <textarea
              value={form.special_instructions}
              onChange={e => set('special_instructions', e.target.value)}
              rows={3}
              placeholder="Any special requirements..."
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-none transition"
            />
          </div>

          {mutation.isError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Failed to create quotation. Please try again.
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-[var(--color-border-subtle)]">
            <Button onClick={handleSubmit} isLoading={mutation.isPending}>Create Quotation</Button>
            <Button variant="ghost" onClick={() => router.push('/quotations')}>Cancel</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
