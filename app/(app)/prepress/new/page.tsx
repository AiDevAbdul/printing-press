'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { prepressService, type Design } from '@/lib/services/prepress.service';

const DESIGN_TYPE_OPTIONS = [
  { value: 'label', label: 'Label' },
  { value: 'box', label: 'Box' },
  { value: 'literature', label: 'Literature / Leaflet' },
  { value: 'logo', label: 'Logo' },
  { value: 'other', label: 'Other' },
];

const CATEGORY_OPTIONS = [
  { value: 'product', label: 'Product' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'logo', label: 'Logo / Branding' },
  { value: 'other', label: 'Other' },
];

type FormData = {
  name: string;
  design_type: string;
  product_category: string;
  product_name: string;
  notes: string;
};

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">
      {text}{required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
    </label>
  );
}

export default function NewDesign() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    name: '',
    design_type: 'label',
    product_category: 'product',
    product_name: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data: Partial<Design>) => prepressService.create(data),
    onSuccess: (design) => router.push(`/prepress/${design.id}`),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const e2: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) e2.name = 'Required';
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;

    const payload: Partial<Design> = {
      name: form.name,
      design_type: form.design_type,
      product_category: form.product_category,
    };
    if (form.product_name) payload.product_name = form.product_name;
    if (form.notes) payload.notes = form.notes;

    mutation.mutate(payload);
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/prepress')}
          className="p-1.5 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] transition-colors"
          aria-label="Back to pre-press"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">New Design</h1>
      </div>

      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Design Details</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mutation.isError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Failed to create design. Please try again.
            </div>
          )}

          <div>
            <FieldLabel text="Design Name" required />
            <Input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Amoxicillin 500mg Label v3"
              fullWidth
              error={errors.name}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel text="Design Type" />
              <Select
                options={DESIGN_TYPE_OPTIONS}
                value={form.design_type}
                onChange={e => set('design_type', e.target.value)}
                fullWidth
              />
            </div>
            <div>
              <FieldLabel text="Category" />
              <Select
                options={CATEGORY_OPTIONS}
                value={form.product_category}
                onChange={e => set('product_category', e.target.value)}
                fullWidth
              />
            </div>
          </div>

          <div>
            <FieldLabel text="Product Name" />
            <Input
              value={form.product_name}
              onChange={e => set('product_name', e.target.value)}
              placeholder="e.g. Amoxicillin 500mg (optional)"
              fullWidth
            />
          </div>

          <div>
            <FieldLabel text="Notes" />
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Design brief, revision history, or any context..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="ghost" onClick={() => router.push('/prepress')}>
              Cancel
            </Button>
            <Button type="submit" isLoading={mutation.isPending}>
              Create Design
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
