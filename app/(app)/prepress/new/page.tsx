'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, AlertCircle, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { prepressService, type Design } from '@/lib/services/prepress.service';

const DESIGN_TYPE_OPTIONS = [
  { value: 'label', label: 'Label' },
  { value: 'carton', label: 'Carton' },
  { value: 'box', label: 'Box' },
  { value: 'leaflet', label: 'Leaflet / Literature' },
  { value: 'blister', label: 'Blister' },
  { value: 'logo', label: 'Logo' },
  { value: 'other', label: 'Other' },
];

const CATEGORY_OPTIONS = [
  { value: 'pharmaceutical', label: 'Pharmaceutical' },
  { value: 'food', label: 'Food' },
  { value: 'cosmetic', label: 'Cosmetic' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'product', label: 'Product' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'logo', label: 'Logo / Branding' },
  { value: 'other', label: 'Other' },
];

const STEPS = ['Basic', 'Printing', 'Finishing', 'Approvals'] as const;
type Step = 0 | 1 | 2 | 3;

type FormData = {
  name: string;
  design_type: string;
  product_category: string;
  product_name: string;
  // printing
  colors: string;
  plates: string;
  printing_notes: string;
  // finishing
  lamination: boolean;
  uv_varnish: boolean;
  embossing: boolean;
  foiling: boolean;
  die_cutting: boolean;
  finishing_notes: string;
  // approvals / general
  approval_notes: string;
};

function buildNotes(form: FormData): string {
  const sections: string[] = [];

  const printLines = [
    form.colors.trim() && `Colors: ${form.colors.trim()}`,
    form.plates.trim() && `Plates: ${form.plates.trim()}`,
    form.printing_notes.trim(),
  ].filter(Boolean);
  if (printLines.length) sections.push(`[Printing Specifications]\n${printLines.join('\n')}`);

  const finishing = [
    form.lamination && 'Lamination',
    form.uv_varnish && 'UV Varnish',
    form.embossing && 'Embossing',
    form.foiling && 'Foiling',
    form.die_cutting && 'Die-cutting',
  ].filter(Boolean) as string[];
  const finishLines = [
    finishing.length && finishing.join(', '),
    form.finishing_notes.trim(),
  ].filter(Boolean);
  if (finishLines.length) sections.push(`[Finishing Requirements]\n${finishLines.join('\n')}`);

  if (form.approval_notes.trim()) sections.push(`[Notes]\n${form.approval_notes.trim()}`);

  return sections.join('\n\n');
}

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">
      {text}
      {required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
    </label>
  );
}

export default function NewDesign() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormData>({
    name: '',
    design_type: 'label',
    product_category: 'pharmaceutical',
    product_name: '',
    colors: '',
    plates: '',
    printing_notes: '',
    lamination: false,
    uv_varnish: false,
    embossing: false,
    foiling: false,
    die_cutting: false,
    finishing_notes: '',
    approval_notes: '',
  });
  const [nameError, setNameError] = useState('');

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data: Partial<Design>) => prepressService.create(data),
    onSuccess: (design) => router.push(`/prepress/${design.id}`),
  });

  function handleNext() {
    if (step === 0 && !form.name.trim()) {
      setNameError('Design name is required');
      return;
    }
    setNameError('');
    setStep((s) => Math.min(s + 1, 3) as Step);
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      setStep(0);
      setNameError('Design name is required');
      return;
    }
    const notes = buildNotes(form);
    const payload: Partial<Design> = {
      name: form.name,
      design_type: form.design_type,
      product_category: form.product_category,
    };
    if (form.product_name.trim()) payload.product_name = form.product_name.trim();
    if (notes) payload.notes = notes;
    mutation.mutate(payload);
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/prepress')}
          className="p-1.5 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">New Design</h1>
      </div>

      <Card variant="elevated" padding="none">
        {/* Step tab bar */}
        <div className="flex border-b border-[var(--color-border-subtle)] overflow-x-auto">
          {STEPS.map((label, i) => {
            const isActive = step === i;
            const isDone = step > i;
            return (
              <button
                key={label}
                onClick={() => { if (i < step) setStep(i as Step); }}
                disabled={i > step}
                className={[
                  'relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-inset',
                  isActive
                    ? 'text-[var(--color-brand)]'
                    : isDone
                    ? 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer'
                    : 'text-[var(--color-text-tertiary)] cursor-not-allowed',
                ].join(' ')}
              >
                <span
                  className={[
                    'w-5 h-5 rounded-full text-xs flex items-center justify-center font-semibold flex-shrink-0',
                    isActive
                      ? 'bg-[var(--color-brand)] text-white'
                      : isDone
                      ? 'bg-[var(--color-success)] text-white'
                      : 'bg-[var(--color-border)] text-[var(--color-text-tertiary)]',
                  ].join(' ')}
                >
                  {isDone ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-brand)] rounded-full" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        {/* Step content */}
        <div className="p-6 space-y-5">
          {mutation.isError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Failed to create design. Please try again.
            </div>
          )}

          {/* ── Step 0: Basic ── */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <FieldLabel text="Design Name" required />
                <Input
                  value={form.name}
                  onChange={(e) => { set('name', e.target.value); if (nameError) setNameError(''); }}
                  placeholder="e.g. Amoxicillin 500mg Label v3"
                  fullWidth
                  error={nameError}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel text="Design Type" />
                  <Select
                    options={DESIGN_TYPE_OPTIONS}
                    value={form.design_type}
                    onChange={(e) => set('design_type', e.target.value)}
                    fullWidth
                  />
                </div>
                <div>
                  <FieldLabel text="Category" />
                  <Select
                    options={CATEGORY_OPTIONS}
                    value={form.product_category}
                    onChange={(e) => set('product_category', e.target.value)}
                    fullWidth
                  />
                </div>
              </div>
              <div>
                <FieldLabel text="Product Name" />
                <Input
                  value={form.product_name}
                  onChange={(e) => set('product_name', e.target.value)}
                  placeholder="e.g. Amoxicillin 500mg (optional)"
                  fullWidth
                />
              </div>
            </div>
          )}

          {/* ── Step 1: Printing ── */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Specify printing requirements for the pre-press team.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel text="Number of Colors" />
                  <Input
                    value={form.colors}
                    onChange={(e) => set('colors', e.target.value)}
                    placeholder="e.g. 4 colors CMYK"
                    fullWidth
                  />
                </div>
                <div>
                  <FieldLabel text="Plates" />
                  <Input
                    value={form.plates}
                    onChange={(e) => set('plates', e.target.value)}
                    placeholder="e.g. 4 plates"
                    fullWidth
                  />
                </div>
              </div>
              <div>
                <FieldLabel text="Printing Notes" />
                <textarea
                  value={form.printing_notes}
                  onChange={(e) => set('printing_notes', e.target.value)}
                  placeholder="Special ink requirements, color profiles, registration marks..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-none"
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Finishing ── */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Select post-print finishing treatments required.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Checkbox
                  id="chk-lamination"
                  label="Lamination"
                  checked={form.lamination}
                  onChange={(e) => set('lamination', e.target.checked)}
                />
                <Checkbox
                  id="chk-uv-varnish"
                  label="UV Varnish"
                  checked={form.uv_varnish}
                  onChange={(e) => set('uv_varnish', e.target.checked)}
                />
                <Checkbox
                  id="chk-embossing"
                  label="Embossing"
                  checked={form.embossing}
                  onChange={(e) => set('embossing', e.target.checked)}
                />
                <Checkbox
                  id="chk-foiling"
                  label="Foiling"
                  checked={form.foiling}
                  onChange={(e) => set('foiling', e.target.checked)}
                />
                <Checkbox
                  id="chk-die-cutting"
                  label="Die-cutting"
                  checked={form.die_cutting}
                  onChange={(e) => set('die_cutting', e.target.checked)}
                />
              </div>
              <div>
                <FieldLabel text="Finishing Notes" />
                <textarea
                  value={form.finishing_notes}
                  onChange={(e) => set('finishing_notes', e.target.value)}
                  placeholder="Additional finishing details, special requirements..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-none"
                />
              </div>
            </div>
          )}

          {/* ── Step 3: Approvals / Review ── */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Summary */}
              <div className="rounded-xl bg-[var(--color-page-bg)] p-4 space-y-3 text-sm">
                <p className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">Summary</p>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <div>
                    <p className="text-[var(--color-text-tertiary)] text-xs">Name</p>
                    <p className="font-medium text-[var(--color-text-primary)] truncate">{form.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[var(--color-text-tertiary)] text-xs">Type</p>
                    <p className="font-medium text-[var(--color-text-primary)] capitalize">{form.design_type}</p>
                  </div>
                  <div>
                    <p className="text-[var(--color-text-tertiary)] text-xs">Category</p>
                    <p className="font-medium text-[var(--color-text-primary)] capitalize">
                      {form.product_category.replace(/_/g, ' ')}
                    </p>
                  </div>
                  {form.product_name && (
                    <div>
                      <p className="text-[var(--color-text-tertiary)] text-xs">Product</p>
                      <p className="font-medium text-[var(--color-text-primary)] truncate">{form.product_name}</p>
                    </div>
                  )}
                  {form.colors && (
                    <div>
                      <p className="text-[var(--color-text-tertiary)] text-xs">Colors</p>
                      <p className="font-medium text-[var(--color-text-primary)]">{form.colors}</p>
                    </div>
                  )}
                  {[form.lamination && 'Lamination', form.uv_varnish && 'UV Varnish', form.embossing && 'Embossing', form.foiling && 'Foiling', form.die_cutting && 'Die-cutting'].filter(Boolean).length > 0 && (
                    <div className="col-span-2">
                      <p className="text-[var(--color-text-tertiary)] text-xs">Finishing</p>
                      <p className="font-medium text-[var(--color-text-primary)]">
                        {[form.lamination && 'Lamination', form.uv_varnish && 'UV Varnish', form.embossing && 'Embossing', form.foiling && 'Foiling', form.die_cutting && 'Die-cutting'].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval notes */}
              <div>
                <FieldLabel text="Notes for Approvers" />
                <textarea
                  value={form.approval_notes}
                  onChange={(e) => set('approval_notes', e.target.value)}
                  placeholder="Context for the approval team, revision history, special instructions..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation footer */}
        <div className="px-6 pb-6 flex items-center justify-between">
          {step > 0 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => Math.max(s - 1, 0) as Step)}
            >
              Back
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={() => router.push('/prepress')}>
              Cancel
            </Button>
          )}

          {step < 3 ? (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} isLoading={mutation.isPending}>
              Create Design
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
