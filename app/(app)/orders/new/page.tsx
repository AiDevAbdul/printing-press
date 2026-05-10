'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ordersService, type Order } from '@/lib/services/orders.service';
import { customersService } from '@/lib/services/customers.service';

const STEPS = ['Basic Info', 'Size & Material', 'Printing', 'Finishing', 'Review'];

const PRODUCT_TYPE_OPTIONS = [
  { value: '', label: 'Select type...' },
  { value: 'cpp_carton', label: 'CPP Carton' },
  { value: 'silvo_blister', label: 'Silvo Blister' },
  { value: 'bent_foil', label: 'Bent Foil' },
  { value: 'alu_alu', label: 'Alu-Alu' },
];

const PRINTING_TYPE_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'offset', label: 'Offset' },
  { value: 'digital', label: 'Digital' },
  { value: 'flexo', label: 'Flexo' },
];

const LAMINATION_OPTIONS = [
  { value: '', label: 'None / Not applicable' },
  { value: 'shine', label: 'Shine' },
  { value: 'matt', label: 'Matt' },
  { value: 'metalize', label: 'Metalize' },
  { value: 'rainbow', label: 'Rainbow' },
];

const VARNISH_OPTIONS = [
  { value: '', label: 'None / Not applicable' },
  { value: 'water_base', label: 'Water Base' },
  { value: 'duck', label: 'Duck' },
  { value: 'plain_uv', label: 'Plain UV' },
  { value: 'spot_uv', label: 'Spot UV' },
  { value: 'drip_off_uv', label: 'Drip Off UV' },
  { value: 'matt_uv', label: 'Matt UV' },
  { value: 'rough_uv', label: 'Rough UV' },
];

const DIE_TYPE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'new_die', label: 'New Die' },
  { value: 'old_die', label: 'Old Die' },
];

const UNIT_OPTIONS = [
  { value: 'pcs', label: 'Pieces' },
  { value: 'sheets', label: 'Sheets' },
  { value: 'rolls', label: 'Rolls' },
  { value: 'kg', label: 'KG' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

type FormData = {
  customer_id: string;
  product_name: string;
  product_type: string;
  order_date: string;
  delivery_date: string;
  quantity: string;
  unit: string;
  priority: string;
  is_repeat_order: boolean;
  special_instructions: string;
  specifications: string;
  batch_number: string;
  substrate: string;
  gsm: string;
  size_length: string;
  size_width: string;
  size_unit: string;
  card_size: string;
  printing_type: string;
  colors: string;
  color_p1: string;
  color_p2: string;
  color_p3: string;
  color_p4: string;
  has_back_printing: boolean;
  has_barcode: boolean;
  lamination_type: string;
  varnish_type: string;
  varnish_details: string;
  uv_emboss_details: string;
  die_type: string;
  die_reference: string;
  finishing_requirements: string;
  quoted_price: string;
};

const today = new Date().toISOString().split('T')[0];

const EMPTY: FormData = {
  customer_id: '', product_name: '', product_type: '',
  order_date: today, delivery_date: '', quantity: '1', unit: 'pcs',
  priority: 'normal', is_repeat_order: false, special_instructions: '',
  specifications: '', batch_number: '',
  substrate: '', gsm: '', size_length: '', size_width: '', size_unit: 'mm', card_size: '',
  printing_type: 'offset', colors: '', color_p1: '', color_p2: '', color_p3: '', color_p4: '',
  has_back_printing: false, has_barcode: false,
  lamination_type: '', varnish_type: '', varnish_details: '', uv_emboss_details: '',
  die_type: '', die_reference: '', finishing_requirements: '',
  quoted_price: '',
};

function label(text: string, required = false) {
  return (
    <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">
      {text}{required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
    </label>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export default function NewOrder() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (k: keyof FormData, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const { data: customersData } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => customersService.getAll({ limit: 200, is_active: true }),
  });

  const customerOptions = [
    { value: '', label: 'Walk-in / No customer' },
    ...(customersData?.data ?? []).map(c => ({
      value: c.id,
      label: c.company_name ? `${c.name} — ${c.company_name}` : c.name,
    })),
  ];

  const mutation = useMutation({
    mutationFn: (data: Partial<Order>) => ordersService.create(data),
    onSuccess: (order) => router.push(`/orders/${order.id}`),
  });

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.product_name.trim()) e.product_name = 'Required';
    if (!form.order_date) e.order_date = 'Required';
    if (!form.delivery_date) e.delivery_date = 'Required';
    if (!form.quantity || parseInt(form.quantity) < 1) e.quantity = 'Must be ≥ 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (step === 0 && !validate()) return;
    setStep(s => s + 1);
  }

  function handleSubmit() {
    if (!validate()) { setStep(0); return; }

    const payload: any = {
      product_name: form.product_name,
      order_date: form.order_date,
      delivery_date: form.delivery_date,
      quantity: parseInt(form.quantity),
      unit: form.unit,
      priority: form.priority,
      is_repeat_order: form.is_repeat_order,
    };

    if (form.customer_id) payload.customer_id = form.customer_id;
    if (form.product_type) payload.product_type = form.product_type;
    if (form.special_instructions) payload.special_instructions = form.special_instructions;
    if (form.specifications) payload.specifications = form.specifications;
    if (form.batch_number) payload.batch_number = form.batch_number;
    if (form.substrate) payload.substrate = form.substrate;
    if (form.gsm) payload.gsm = form.gsm;
    if (form.size_length) payload.size_length = parseFloat(form.size_length);
    if (form.size_width) payload.size_width = parseFloat(form.size_width);
    if (form.size_unit) payload.size_unit = form.size_unit;
    if (form.card_size) payload.card_size = form.card_size;
    if (form.printing_type) payload.printing_type = form.printing_type;
    if (form.colors) payload.colors = form.colors;
    if (form.color_p1) payload.color_p1 = form.color_p1;
    if (form.color_p2) payload.color_p2 = form.color_p2;
    if (form.color_p3) payload.color_p3 = form.color_p3;
    if (form.color_p4) payload.color_p4 = form.color_p4;
    payload.has_back_printing = form.has_back_printing;
    payload.has_barcode = form.has_barcode;
    if (form.lamination_type) payload.lamination_type = form.lamination_type;
    if (form.varnish_type) payload.varnish_type = form.varnish_type;
    if (form.varnish_details) payload.varnish_details = form.varnish_details;
    if (form.uv_emboss_details) payload.uv_emboss_details = form.uv_emboss_details;
    if (form.die_type) payload.die_type = form.die_type;
    if (form.die_reference) payload.die_reference = form.die_reference;
    if (form.finishing_requirements) payload.finishing_requirements = form.finishing_requirements;
    if (form.quoted_price) payload.quoted_price = parseFloat(form.quoted_price);

    mutation.mutate(payload);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/orders')}
          className="p-1.5 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] transition-colors"
          aria-label="Back to orders"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">New Order</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className="flex flex-col items-center gap-1 min-w-0"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                i < step ? 'bg-[var(--color-brand)] text-white' :
                i === step ? 'bg-[var(--color-brand)] text-white ring-2 ring-[var(--color-brand)] ring-offset-2' :
                'bg-[var(--color-border)] text-[var(--color-text-tertiary)]'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block truncate max-w-[70px] ${
                i === step ? 'text-[var(--color-brand)] font-medium' : 'text-[var(--color-text-tertiary)]'
              }`}>
                {s}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${i < step ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-border)]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>{STEPS[step]}</CardTitle>
        </CardHeader>

        {step === 0 && (
          <div className="space-y-4">
            <Field>
              {label('Customer')}
              <Select options={customerOptions} value={form.customer_id} onChange={e => set('customer_id', e.target.value)} fullWidth />
            </Field>
            <Row>
              <Field>
                {label('Product Name', true)}
                <Input
                  value={form.product_name}
                  onChange={e => set('product_name', e.target.value)}
                  placeholder="e.g. Amoxicillin 500mg Carton"
                  fullWidth
                  error={errors.product_name}
                />
              </Field>
              <Field>
                {label('Product Type')}
                <Select options={PRODUCT_TYPE_OPTIONS} value={form.product_type} onChange={e => set('product_type', e.target.value)} fullWidth />
              </Field>
            </Row>
            <Row>
              <Field>
                {label('Order Date', true)}
                <Input type="date" value={form.order_date} onChange={e => set('order_date', e.target.value)} fullWidth error={errors.order_date} />
              </Field>
              <Field>
                {label('Delivery Date', true)}
                <Input type="date" value={form.delivery_date} onChange={e => set('delivery_date', e.target.value)} fullWidth error={errors.delivery_date} />
              </Field>
            </Row>
            <Row>
              <Field>
                {label('Quantity', true)}
                <Input
                  type="number" min="1"
                  value={form.quantity}
                  onChange={e => set('quantity', e.target.value)}
                  fullWidth error={errors.quantity}
                />
              </Field>
              <Field>
                {label('Unit')}
                <Select options={UNIT_OPTIONS} value={form.unit} onChange={e => set('unit', e.target.value)} fullWidth />
              </Field>
            </Row>
            <Row>
              <Field>
                {label('Priority')}
                <Select options={PRIORITY_OPTIONS} value={form.priority} onChange={e => set('priority', e.target.value)} fullWidth />
              </Field>
              <Field>
                {label('Batch Number')}
                <Input value={form.batch_number} onChange={e => set('batch_number', e.target.value)} placeholder="Optional" fullWidth />
              </Field>
            </Row>
            <Field>
              {label('Special Instructions')}
              <textarea
                value={form.special_instructions}
                onChange={e => set('special_instructions', e.target.value)}
                placeholder="Any special requirements..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-none"
              />
            </Field>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="repeat"
                checked={form.is_repeat_order}
                onChange={e => set('is_repeat_order', e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-brand)]"
              />
              <label htmlFor="repeat" className="text-sm text-[var(--color-text-primary)]">Repeat order</label>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Row>
              <Field>
                {label('Substrate')}
                <Input value={form.substrate} onChange={e => set('substrate', e.target.value)} placeholder="e.g. Art Paper, Duplex" fullWidth />
              </Field>
              <Field>
                {label('GSM')}
                <Input value={form.gsm} onChange={e => set('gsm', e.target.value)} placeholder="e.g. 350" fullWidth />
              </Field>
            </Row>
            <Row>
              <Field>
                {label('Length')}
                <Input type="number" value={form.size_length} onChange={e => set('size_length', e.target.value)} placeholder="0.00" fullWidth />
              </Field>
              <Field>
                {label('Width')}
                <Input type="number" value={form.size_width} onChange={e => set('size_width', e.target.value)} placeholder="0.00" fullWidth />
              </Field>
            </Row>
            <Row>
              <Field>
                {label('Size Unit')}
                <Select
                  options={[{ value: 'mm', label: 'mm' }, { value: 'cm', label: 'cm' }, { value: 'inch', label: 'inch' }]}
                  value={form.size_unit}
                  onChange={e => set('size_unit', e.target.value)}
                  fullWidth
                />
              </Field>
              <Field>
                {label('Card Size')}
                <Input value={form.card_size} onChange={e => set('card_size', e.target.value)} placeholder="e.g. A4, Custom" fullWidth />
              </Field>
            </Row>
            <Field>
              {label('Specifications')}
              <textarea
                value={form.specifications}
                onChange={e => set('specifications', e.target.value)}
                placeholder="Technical specifications..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-none"
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Row>
              <Field>
                {label('Printing Type')}
                <Select options={PRINTING_TYPE_OPTIONS} value={form.printing_type} onChange={e => set('printing_type', e.target.value)} fullWidth />
              </Field>
              <Field>
                {label('No. of Colors')}
                <Input value={form.colors} onChange={e => set('colors', e.target.value)} placeholder="e.g. 4+1" fullWidth />
              </Field>
            </Row>
            <div className="grid grid-cols-2 gap-4">
              {(['color_p1', 'color_p2', 'color_p3', 'color_p4'] as const).map((k, i) => (
                <Field key={k}>
                  {label(`Color ${i + 1}`)}
                  <Input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={`e.g. PANTONE 285 C`} fullWidth />
                </Field>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {[
                { id: 'back_printing', key: 'has_back_printing' as const, label: 'Has back printing' },
                { id: 'barcode', key: 'has_barcode' as const, label: 'Has barcode' },
              ].map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={item.id}
                    checked={form[item.key] as boolean}
                    onChange={e => set(item.key, e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-brand)]"
                  />
                  <label htmlFor={item.id} className="text-sm text-[var(--color-text-primary)]">{item.label}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Row>
              <Field>
                {label('Lamination')}
                <Select options={LAMINATION_OPTIONS} value={form.lamination_type} onChange={e => set('lamination_type', e.target.value)} fullWidth />
              </Field>
              <Field>
                {label('Varnish')}
                <Select options={VARNISH_OPTIONS} value={form.varnish_type} onChange={e => set('varnish_type', e.target.value)} fullWidth />
              </Field>
            </Row>
            <Field>
              {label('Varnish Details')}
              <Input value={form.varnish_details} onChange={e => set('varnish_details', e.target.value)} placeholder="Optional details" fullWidth />
            </Field>
            <Field>
              {label('UV / Emboss Details')}
              <Input value={form.uv_emboss_details} onChange={e => set('uv_emboss_details', e.target.value)} placeholder="Optional details" fullWidth />
            </Field>
            <Row>
              <Field>
                {label('Die Type')}
                <Select options={DIE_TYPE_OPTIONS} value={form.die_type} onChange={e => set('die_type', e.target.value)} fullWidth />
              </Field>
              <Field>
                {label('Die Reference')}
                <Input value={form.die_reference} onChange={e => set('die_reference', e.target.value)} placeholder="e.g. D-1042" fullWidth />
              </Field>
            </Row>
            <Field>
              {label('Finishing Requirements')}
              <Input value={form.finishing_requirements} onChange={e => set('finishing_requirements', e.target.value)} placeholder="Other finishing notes" fullWidth />
            </Field>
            <Field>
              {label('Quoted Price (PKR)')}
              <Input type="number" value={form.quoted_price} onChange={e => set('quoted_price', e.target.value)} placeholder="0" fullWidth />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            {mutation.isError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Failed to create order. Please try again.
              </div>
            )}
            <ReviewSection title="Basic Info">
              <ReviewRow label="Product" value={form.product_name} />
              <ReviewRow label="Product Type" value={PRODUCT_TYPE_OPTIONS.find(o => o.value === form.product_type)?.label} />
              <ReviewRow label="Order Date" value={form.order_date} />
              <ReviewRow label="Delivery Date" value={form.delivery_date} />
              <ReviewRow label="Quantity" value={`${form.quantity} ${form.unit}`} />
              <ReviewRow label="Priority" value={form.priority} />
              {form.batch_number && <ReviewRow label="Batch" value={form.batch_number} />}
              {form.is_repeat_order && <ReviewRow label="Repeat Order" value="Yes" />}
            </ReviewSection>
            {(form.substrate || form.gsm || form.size_length) && (
              <ReviewSection title="Size & Material">
                {form.substrate && <ReviewRow label="Substrate" value={form.substrate} />}
                {form.gsm && <ReviewRow label="GSM" value={form.gsm} />}
                {form.size_length && <ReviewRow label="Size" value={`${form.size_length} × ${form.size_width} ${form.size_unit}`} />}
                {form.card_size && <ReviewRow label="Card Size" value={form.card_size} />}
              </ReviewSection>
            )}
            {(form.printing_type || form.colors) && (
              <ReviewSection title="Printing">
                {form.printing_type && <ReviewRow label="Type" value={form.printing_type} />}
                {form.colors && <ReviewRow label="Colors" value={form.colors} />}
                {form.color_p1 && <ReviewRow label="Color 1" value={form.color_p1} />}
                {form.color_p2 && <ReviewRow label="Color 2" value={form.color_p2} />}
                {form.color_p3 && <ReviewRow label="Color 3" value={form.color_p3} />}
                {form.color_p4 && <ReviewRow label="Color 4" value={form.color_p4} />}
                {form.has_back_printing && <ReviewRow label="Back Printing" value="Yes" />}
                {form.has_barcode && <ReviewRow label="Barcode" value="Yes" />}
              </ReviewSection>
            )}
            {(form.lamination_type || form.varnish_type || form.die_type) && (
              <ReviewSection title="Finishing">
                {form.lamination_type && <ReviewRow label="Lamination" value={form.lamination_type} />}
                {form.varnish_type && <ReviewRow label="Varnish" value={form.varnish_type} />}
                {form.die_type && <ReviewRow label="Die" value={form.die_type} />}
                {form.die_reference && <ReviewRow label="Die Ref." value={form.die_reference} />}
                {form.quoted_price && <ReviewRow label="Quoted (PKR)" value={parseFloat(form.quoted_price).toLocaleString()} />}
              </ReviewSection>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-border-subtle)]">
          {step > 0 ? (
            <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => setStep(s => s - 1)}>
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => router.push('/orders')}>Cancel</Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={handleNext}>
              Next: {STEPS[step + 1]} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} isLoading={mutation.isPending}>
              Create Order
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)] mb-2">{title}</h3>
      <div className="rounded-lg border border-[var(--color-border-subtle)] divide-y divide-[var(--color-border-subtle)]">
        {children}
      </div>
    </div>
  );
}

function ReviewRow({ label: l, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-xs text-[var(--color-text-tertiary)]">{l}</span>
      <span className="text-sm text-[var(--color-text-primary)] font-medium">{value}</span>
    </div>
  );
}
