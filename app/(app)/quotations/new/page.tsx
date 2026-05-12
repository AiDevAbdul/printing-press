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

const PRODUCT_TYPES = [
  'Unit Carton', 'Label', 'Leaflet', 'Literature', 'Sticker',
  'Inner', 'Aluminium Foil', 'Alu Alu Foil', 'Sachet Foil',
  'Meggie Foil', 'Food Foil', 'Others',
];

const PAPER_TYPE_MAP: Record<string, string[]> = {
  'Unit Carton': ['Bleach Card', 'Box Board', 'Art Card'],
  'Label': ['Art Paper', 'Matt Paper'],
  'Leaflet': ['News Paper', 'Printing Paper', 'VRG Paper', 'Offset Paper'],
  'Literature': ['Art Paper', 'Matt Paper', 'Art Card'],
  'Booklet': ['Art Paper', 'Matt Paper'],
  'Stationary': ['Carbonless', 'ColorBond', 'Writing Paper', 'Offset Paper'],
  'Sticker': ['China', 'Branded', 'PVC', 'Silver'],
};

const GSM_OPTIONS = [190, 200, 206, 210, 215, 230, 240, 250, 270, 290, 300, 320, 350];

const COATING_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'water_base', label: 'Water Base' },
  { value: 'duck', label: 'Duck' },
  { value: 'plain_uv', label: 'Plain UV' },
  { value: 'spot_uv', label: 'Spot UV' },
  { value: 'drip_off_uv', label: 'Drip Off UV' },
  { value: 'matt_uv', label: 'Matt UV' },
  { value: 'rough_uv', label: 'Rough UV' },
];

const UNIT_OPTIONS = [
  { value: 'pcs', label: 'Pieces' },
  { value: 'sheets', label: 'Sheets' },
  { value: 'rolls', label: 'Rolls' },
  { value: 'kg', label: 'KG' },
];

const DOUBLE_SHEET_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'Bleach', label: 'Bleach' },
  { value: 'Box Board', label: 'Box Board' },
];

type FormData = {
  customer_id: string;
  quotation_date: string;
  valid_until: string;
  product_name: string;
  product_type: string;
  product_type_custom: string;
  quantity: string;
  unit: string;
  double_sheet: string;
  length: string;
  width: string;
  dimension_unit: string;
  paper_type: string;
  gsm: string;
  four_color_process: boolean;
  inside_printing: boolean;
  cmyk_cyan: boolean;
  cmyk_magenta: boolean;
  cmyk_yellow: boolean;
  cmyk_black: boolean;
  pantone_cmyk_1: string;
  pantone_cmyk_2: string;
  pantone_cmyk_3: string;
  pantone_cmyk_4: string;
  bar_code: string;
  dye_req: string;
  batch_no_printing: boolean;
  batch_no: string;
  mfg_date: string;
  exp_date: string;
  mrp_rs: string;
  varnish_type: string;
  foiling: boolean;
  bleach_card: boolean;
  box_board_card: boolean;
  art_card: boolean;
  ups: string;
  price_per_kg_card: string;
  conversion_percent_card: string;
  fixed_charge_ctp: string;
  fixed_charge_spot_uv: string;
  fixed_charge_plain_uv: string;
  fixed_charge_drip_off_uv: string;
  fixed_charge_metalize: string;
  fixed_charge_emboss: string;
  fixed_charge_lamination: string;
  paper_ups: string;
  price_per_kg_paper: string;
  conversion_percent_paper: string;
  fixed_charge_others: string;
  special_instructions: string;
};

const today = new Date().toISOString().split('T')[0];
const thirtyDays = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

const EMPTY: FormData = {
  customer_id: '', quotation_date: today, valid_until: thirtyDays,
  product_name: '', product_type: '', product_type_custom: '',
  quantity: '1', unit: 'pcs', double_sheet: '',
  length: '', width: '', dimension_unit: 'mm',
  paper_type: '', gsm: '',
  four_color_process: false, inside_printing: false,
  cmyk_cyan: false, cmyk_magenta: false, cmyk_yellow: false, cmyk_black: false,
  pantone_cmyk_1: '', pantone_cmyk_2: '', pantone_cmyk_3: '', pantone_cmyk_4: '',
  bar_code: '', dye_req: '',
  batch_no_printing: false, batch_no: '', mfg_date: '', exp_date: '', mrp_rs: '',
  varnish_type: 'none', foiling: false,
  bleach_card: false, box_board_card: false, art_card: false,
  ups: '', price_per_kg_card: '', conversion_percent_card: '',
  fixed_charge_ctp: '', fixed_charge_spot_uv: '', fixed_charge_plain_uv: '',
  fixed_charge_drip_off_uv: '', fixed_charge_metalize: '',
  fixed_charge_emboss: '', fixed_charge_lamination: '',
  paper_ups: '', price_per_kg_paper: '', conversion_percent_paper: '',
  fixed_charge_others: '',
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

function CheckboxRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded accent-[var(--color-brand)]"
      />
      <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
    </label>
  );
}

function CalcField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label text={label} />
      <div className="px-3 py-2.5 rounded-xl bg-[var(--color-border-subtle)] text-sm text-[var(--color-text-secondary)] font-mono">
        {value || '—'}
      </div>
    </div>
  );
}

function fmt(n: number, decimals = 4): string {
  if (!isFinite(n) || isNaN(n)) return '—';
  return n.toFixed(decimals);
}

export default function NewQuotation() {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (k: keyof FormData, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

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

  const paperTypeOptions = PAPER_TYPE_MAP[form.product_type] ?? [];

  // Convert dimensions to inches (formulas require inches)
  const rawL = parseFloat(form.length) || 0;
  const rawW = parseFloat(form.width) || 0;
  const dimToInch = form.dimension_unit === 'mm' ? 1 / 25.4 : form.dimension_unit === 'cm' ? 1 / 2.54 : 1;
  const L = rawL * dimToInch;
  const W = rawW * dimToInch;

  // Cost formula calculations — Card/Sticker
  // Formula: L(in) × W(in) × GSM ÷ 15,500 = packet weight (kg) [1 packet = 100 sheets]
  // Packets needed = Qty ÷ (Ups × 100) | Total cost = Packets × Weight × Price/kg | Cost/unit = Total ÷ Qty
  const G = parseFloat(form.gsm) || 0;
  const Q = parseFloat(form.quantity) || 0;
  const cardUps = parseInt(form.ups) || 0;
  const cardPkg = parseFloat(form.price_per_kg_card) || 0;
  const cardPacketWeight = L > 0 && W > 0 && G > 0 ? (L * W * G) / 15500 : 0;
  const cardTotalUps = cardUps * 100;
  const cardPacketsRequired = cardTotalUps > 0 ? Q / cardTotalUps : 0;
  const cardTotalCost = cardPacketsRequired * cardPacketWeight * cardPkg;
  const cardCostPerUnit = Q > 0 ? cardTotalCost / Q : 0;

  // Cost formula calculations — Paper
  // Formula: L(in) × W(in) × GSM ÷ 3,100 = ream weight (kg) [1 ream = 500 sheets]
  // Reams needed = Qty ÷ (Ups × 500) | Total cost = Reams × Weight × Price/kg | Cost/unit = Total ÷ Qty
  const paperUps = parseInt(form.paper_ups) || 0;
  const paperPkg = parseFloat(form.price_per_kg_paper) || 0;
  const paperReamWeight = L > 0 && W > 0 && G > 0 ? (L * W * G) / 3100 : 0;
  const paperTotalUps = paperUps * 500;
  const paperReamsRequired = paperTotalUps > 0 ? Q / paperTotalUps : 0;
  const paperTotalCost = paperReamsRequired * paperReamWeight * paperPkg;
  const paperCostPerUnit = Q > 0 ? paperTotalCost / Q : 0;

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

    const effectiveProductType = form.product_type === 'Others'
      ? (form.product_type_custom || 'Others')
      : form.product_type;

    const payload: Partial<Quotation> = {
      customer_id: form.customer_id,
      quotation_date: new Date(form.quotation_date).toISOString(),
      valid_until: new Date(form.valid_until).toISOString(),
      product_name: form.product_name,
      product_type: effectiveProductType,
      quantity: parseInt(form.quantity),
      unit: form.unit,
    };

    // Optional string fields
    if (form.double_sheet) payload.double_sheet = form.double_sheet;
    if (form.length) payload.length = parseFloat(form.length);
    if (form.width) payload.width = parseFloat(form.width);
    if (form.dimension_unit) payload.dimension_unit = form.dimension_unit;
    if (form.paper_type) payload.paper_type = form.paper_type;
    if (form.gsm) payload.gsm = parseInt(form.gsm);

    // Color process
    payload.four_color_process = form.four_color_process;
    payload.inside_printing = form.inside_printing;
    payload.cmyk_cyan = form.cmyk_cyan;
    payload.cmyk_magenta = form.cmyk_magenta;
    payload.cmyk_yellow = form.cmyk_yellow;
    payload.cmyk_black = form.cmyk_black;
    if (form.pantone_cmyk_1) payload.pantone_cmyk_1 = form.pantone_cmyk_1;
    if (form.pantone_cmyk_2) payload.pantone_cmyk_2 = form.pantone_cmyk_2;
    if (form.pantone_cmyk_3) payload.pantone_cmyk_3 = form.pantone_cmyk_3;
    if (form.pantone_cmyk_4) payload.pantone_cmyk_4 = form.pantone_cmyk_4;

    // Printing details
    if (form.bar_code) payload.bar_code = form.bar_code;
    if (form.dye_req) payload.dye_req = form.dye_req;
    payload.batch_no_printing = form.batch_no_printing;
    if (form.batch_no) payload.batch_no = form.batch_no;
    if (form.mfg_date) payload.mfg_date = new Date(form.mfg_date).toISOString();
    if (form.exp_date) payload.exp_date = new Date(form.exp_date).toISOString();
    if (form.mrp_rs) payload.mrp_rs = parseFloat(form.mrp_rs);

    // Finishing
    if (form.varnish_type) payload.varnish_type = form.varnish_type;
    payload.foiling = form.foiling;
    payload.bleach_card = form.bleach_card;
    payload.box_board_card = form.box_board_card;
    payload.art_card = form.art_card;

    // Card cost
    if (form.ups) payload.ups = parseInt(form.ups);
    if (form.price_per_kg_card) payload.price_per_kg_card = parseFloat(form.price_per_kg_card);
    if (form.conversion_percent_card) payload.conversion_percent_card = parseFloat(form.conversion_percent_card);
    if (form.fixed_charge_ctp) payload.fixed_charge_ctp = parseFloat(form.fixed_charge_ctp);
    if (form.fixed_charge_spot_uv) payload.fixed_charge_spot_uv = parseFloat(form.fixed_charge_spot_uv);
    if (form.fixed_charge_plain_uv) payload.fixed_charge_plain_uv = parseFloat(form.fixed_charge_plain_uv);
    if (form.fixed_charge_drip_off_uv) payload.fixed_charge_drip_off_uv = parseFloat(form.fixed_charge_drip_off_uv);
    if (form.fixed_charge_metalize) payload.fixed_charge_metalize = parseFloat(form.fixed_charge_metalize);
    if (form.fixed_charge_emboss) payload.fixed_charge_emboss = parseFloat(form.fixed_charge_emboss);
    if (form.fixed_charge_lamination) payload.fixed_charge_lamination = parseFloat(form.fixed_charge_lamination);

    // Paper cost
    if (form.paper_ups) payload.paper_ups = parseInt(form.paper_ups);
    if (form.price_per_kg_paper) payload.price_per_kg_paper = parseFloat(form.price_per_kg_paper);
    if (form.conversion_percent_paper) payload.conversion_percent_paper = parseFloat(form.conversion_percent_paper);
    if (form.fixed_charge_others) payload.fixed_charge_others = parseFloat(form.fixed_charge_others);

    if (form.special_instructions) payload.special_instructions = form.special_instructions;

    mutation.mutate(payload);
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] transition';

  return (
    <div className="max-w-3xl space-y-6">
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

      {/* ── Quotation Details ── */}
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
        </div>
      </Card>

      {/* ── Product ── */}
      <Card variant="elevated" padding="lg">
        <CardHeader><CardTitle>Product</CardTitle></CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label text="Product Name" required />
              <Input value={form.product_name} onChange={e => set('product_name', e.target.value)} placeholder="e.g. Amoxicillin 500mg Carton" fullWidth error={errors.product_name} />
            </div>
            <div>
              <Label text="Product Type" />
              <input
                list="product-type-list"
                value={form.product_type}
                onChange={e => {
                  set('product_type', e.target.value);
                  set('paper_type', '');
                }}
                placeholder="Search product type..."
                className={inputCls}
              />
              <datalist id="product-type-list">
                {PRODUCT_TYPES.map(t => <option key={t} value={t} />)}
              </datalist>
              {form.product_type === 'Others' && (
                <div className="mt-2">
                  <Input
                    value={form.product_type_custom}
                    onChange={e => set('product_type_custom', e.target.value)}
                    placeholder="Specify product type..."
                    fullWidth
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label text="Quantity" required />
              <Input type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} fullWidth error={errors.quantity} />
            </div>
            <div>
              <Label text="Unit" />
              <Select options={UNIT_OPTIONS} value={form.unit} onChange={e => set('unit', e.target.value)} fullWidth />
            </div>
            <div>
              <Label text="Double Sheet" />
              <Select options={DOUBLE_SHEET_OPTIONS} value={form.double_sheet} onChange={e => set('double_sheet', e.target.value)} fullWidth />
            </div>
          </div>
        </div>
      </Card>

      {/* ── Dimensions & Material ── */}
      <Card variant="elevated" padding="lg">
        <CardHeader><CardTitle>Dimensions &amp; Material</CardTitle></CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label text="Length (Grain)" />
              <Input type="number" value={form.length} onChange={e => set('length', e.target.value)} placeholder="0.00" fullWidth />
            </div>
            <div>
              <Label text="Width" />
              <Input type="number" value={form.width} onChange={e => set('width', e.target.value)} placeholder="0.00" fullWidth />
            </div>
            <div>
              <Label text="Unit" />
              <Select
                options={[{ value: 'mm', label: 'mm' }, { value: 'cm', label: 'cm' }, { value: 'inch', label: 'inch' }]}
                value={form.dimension_unit}
                onChange={e => set('dimension_unit', e.target.value)}
                fullWidth
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label text="Paper Type" />
              {paperTypeOptions.length > 0 ? (
                <Select
                  options={[{ value: '', label: 'Select paper type...' }, ...paperTypeOptions.map(t => ({ value: t, label: t }))]}
                  value={form.paper_type}
                  onChange={e => set('paper_type', e.target.value)}
                  fullWidth
                />
              ) : (
                <Input value={form.paper_type} onChange={e => set('paper_type', e.target.value)} placeholder="e.g. Art Paper, Duplex" fullWidth />
              )}
            </div>
            <div>
              <Label text="GSM" />
              <Select
                options={[{ value: '', label: 'Select GSM...' }, ...GSM_OPTIONS.map(g => ({ value: String(g), label: String(g) }))]}
                value={form.gsm}
                onChange={e => set('gsm', e.target.value)}
                fullWidth
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ── Color Process ── */}
      <Card variant="elevated" padding="lg">
        <CardHeader><CardTitle>Color Process</CardTitle></CardHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-5">
            <CheckboxRow label="4 Color Process" checked={form.four_color_process} onChange={v => set('four_color_process', v)} />
            <CheckboxRow label="Inside Printing" checked={form.inside_printing} onChange={v => set('inside_printing', v)} />
          </div>

          <Divider title="CMYK Special" />
          <div className="flex flex-wrap gap-5">
            <CheckboxRow label="Cyan" checked={form.cmyk_cyan} onChange={v => set('cmyk_cyan', v)} />
            <CheckboxRow label="Magenta" checked={form.cmyk_magenta} onChange={v => set('cmyk_magenta', v)} />
            <CheckboxRow label="Yellow" checked={form.cmyk_yellow} onChange={v => set('cmyk_yellow', v)} />
            <CheckboxRow label="Black" checked={form.cmyk_black} onChange={v => set('cmyk_black', v)} />
          </div>

          <Divider title="Pantone" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(['1', '2', '3', '4'] as const).map(n => (
              <div key={n}>
                <Label text={`Pantone ${n}`} />
                <Input
                  value={(form as any)[`pantone_cmyk_${n}`]}
                  onChange={e => set(`pantone_cmyk_${n}` as keyof FormData, e.target.value)}
                  placeholder="e.g. PMS 485"
                  fullWidth
                />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Printing Details ── */}
      <Card variant="elevated" padding="lg">
        <CardHeader><CardTitle>Printing Details</CardTitle></CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label text="Bar Code" />
              <Select
                options={[{ value: '', label: 'Select...' }, { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                value={form.bar_code}
                onChange={e => set('bar_code', e.target.value)}
                fullWidth
              />
            </div>
            <div>
              <Label text="Dye Req" />
              <Select
                options={[{ value: '', label: 'Select...' }, { value: 'old', label: 'Old' }, { value: 'new', label: 'New' }]}
                value={form.dye_req}
                onChange={e => set('dye_req', e.target.value)}
                fullWidth
              />
            </div>
          </div>

          <div>
            <CheckboxRow
              label="Batch No Printing"
              checked={form.batch_no_printing}
              onChange={v => set('batch_no_printing', v)}
            />
          </div>

          {form.batch_no_printing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6 border-l-2 border-[var(--color-brand)]">
              <div>
                <Label text="Batch No" />
                <Input value={form.batch_no} onChange={e => set('batch_no', e.target.value)} placeholder="e.g. BN-2024-001" fullWidth />
              </div>
              <div>
                <Label text="MFG Date" />
                <Input type="date" value={form.mfg_date} onChange={e => set('mfg_date', e.target.value)} fullWidth />
              </div>
              <div>
                <Label text="EXP Date" />
                <Input type="date" value={form.exp_date} onChange={e => set('exp_date', e.target.value)} fullWidth />
              </div>
              <div>
                <Label text="MRP Rs." />
                <Input type="number" value={form.mrp_rs} onChange={e => set('mrp_rs', e.target.value)} placeholder="0.00" fullWidth />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── Finishing ── */}
      <Card variant="elevated" padding="lg">
        <CardHeader><CardTitle>Finishing</CardTitle></CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label text="Coating" />
              <Select options={COATING_OPTIONS} value={form.varnish_type} onChange={e => set('varnish_type', e.target.value)} fullWidth />
            </div>
          </div>

          <div className="flex flex-wrap gap-5">
            <CheckboxRow label="Gold Leaf Panny" checked={form.foiling} onChange={v => set('foiling', v)} />
            <CheckboxRow label="Bleach Card" checked={form.bleach_card} onChange={v => set('bleach_card', v)} />
            <CheckboxRow label="Box Board Card" checked={form.box_board_card} onChange={v => set('box_board_card', v)} />
            <CheckboxRow label="Art Card" checked={form.art_card} onChange={v => set('art_card', v)} />
          </div>
        </div>
      </Card>

      {/* ── Card / Sticker Cost Formula ── */}
      <Card variant="elevated" padding="lg">
        <CardHeader><CardTitle>Card / Sticker Cost</CardTitle></CardHeader>
        <div className="space-y-4">
          <p className="text-xs text-[var(--color-text-tertiary)]">
            L(in) × W(in) × GSM ÷ 15,500 = packet weight (kg) · Packets = Qty ÷ (Ups × 100) · Cost/unit = Total ÷ Qty
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <CalcField label="Packet Weight (kg)" value={cardPacketWeight > 0 ? fmt(cardPacketWeight) : ''} />
            <div>
              <Label text="Ups (input)" />
              <Input type="number" value={form.ups} onChange={e => set('ups', e.target.value)} placeholder="e.g. 8" fullWidth />
            </div>
            <CalcField label="Total Ups" value={cardTotalUps > 0 ? String(cardTotalUps) : ''} />
            <CalcField label="Packets Required" value={cardPacketsRequired > 0 ? fmt(cardPacketsRequired, 2) : ''} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label text="Price / kg (input)" />
              <Input type="number" value={form.price_per_kg_card} onChange={e => set('price_per_kg_card', e.target.value)} placeholder="0.00" fullWidth />
            </div>
            <CalcField label="Total Cost" value={cardTotalCost > 0 ? fmt(cardTotalCost, 2) : ''} />
            <CalcField label="Cost per Unit" value={cardCostPerUnit > 0 ? fmt(cardCostPerUnit, 4) : ''} />
            <div>
              <Label text="Conversion %" />
              <Input type="number" value={form.conversion_percent_card} onChange={e => set('conversion_percent_card', e.target.value)} placeholder="0.00" fullWidth />
            </div>
          </div>

          <Divider title="Fixed Charges" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ['CTP', 'fixed_charge_ctp'],
              ['Spot UV', 'fixed_charge_spot_uv'],
              ['Plain UV', 'fixed_charge_plain_uv'],
              ['Drip Off UV', 'fixed_charge_drip_off_uv'],
              ['Metalize', 'fixed_charge_metalize'],
              ['Emboss', 'fixed_charge_emboss'],
              ['Lamination', 'fixed_charge_lamination'],
            ].map(([lbl, key]) => (
              <div key={key}>
                <Label text={lbl} />
                <Input
                  type="number"
                  value={(form as any)[key]}
                  onChange={e => set(key as keyof FormData, e.target.value)}
                  placeholder="0.00"
                  fullWidth
                />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Paper Cost Formula ── */}
      <Card variant="elevated" padding="lg">
        <CardHeader><CardTitle>Paper Cost</CardTitle></CardHeader>
        <div className="space-y-4">
          <p className="text-xs text-[var(--color-text-tertiary)]">
            L(in) × W(in) × GSM ÷ 3,100 = ream weight (kg) · Reams = Qty ÷ (Ups × 500) · Cost/unit = Total ÷ Qty
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <CalcField label="Ream Weight (kg)" value={paperReamWeight > 0 ? fmt(paperReamWeight) : ''} />
            <div>
              <Label text="Ups (input)" />
              <Input type="number" value={form.paper_ups} onChange={e => set('paper_ups', e.target.value)} placeholder="e.g. 8" fullWidth />
            </div>
            <CalcField label="Total Ups" value={paperTotalUps > 0 ? String(paperTotalUps) : ''} />
            <CalcField label="Reams Required" value={paperReamsRequired > 0 ? fmt(paperReamsRequired, 2) : ''} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label text="Price / kg (input)" />
              <Input type="number" value={form.price_per_kg_paper} onChange={e => set('price_per_kg_paper', e.target.value)} placeholder="0.00" fullWidth />
            </div>
            <CalcField label="Total Cost" value={paperTotalCost > 0 ? fmt(paperTotalCost, 2) : ''} />
            <CalcField label="Cost per Unit" value={paperCostPerUnit > 0 ? fmt(paperCostPerUnit, 4) : ''} />
            <div>
              <Label text="Conversion %" />
              <Input type="number" value={form.conversion_percent_paper} onChange={e => set('conversion_percent_paper', e.target.value)} placeholder="0.00" fullWidth />
            </div>
          </div>

          <Divider title="Fixed Charges" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <Label text="CTP" />
              <Input type="number" value={form.fixed_charge_ctp} onChange={e => set('fixed_charge_ctp', e.target.value)} placeholder="0.00" fullWidth />
            </div>
            <div>
              <Label text="Others" />
              <Input type="number" value={form.fixed_charge_others} onChange={e => set('fixed_charge_others', e.target.value)} placeholder="0.00" fullWidth />
            </div>
          </div>
        </div>
      </Card>

      {/* ── Special Instructions + Actions ── */}
      <Card variant="elevated" padding="lg">
        <div className="space-y-4">
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
