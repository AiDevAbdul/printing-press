'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calculator, AlertCircle, Save } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Alert } from '@/components/ui/Alert';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function fetchConfig() {
  const res = await fetch(`${API_BASE}/costing`, { credentials: 'include' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch costing config');
  return res.json();
}

async function saveConfig(data: Record<string, number>) {
  const res = await fetch(`${API_BASE}/costing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save config');
  return res.json();
}

const FIELDS = [
  { key: 'paper_rate_per_kg', label: 'Paper Rate per Kg', unit: 'PKR/kg', description: 'Base cost for paper material' },
  { key: 'cmyk_base_rate', label: 'CMYK Base Rate', unit: 'PKR', description: 'Base printing cost for CMYK' },
  { key: 'special_color_rate', label: 'Special Color Rate', unit: 'PKR/color', description: 'Cost per Pantone / spot color' },
  { key: 'spot_uv_rate_per_sqm', label: 'Spot UV Rate', unit: 'PKR/sqm', description: 'Spot UV finishing cost' },
  { key: 'lamination_rate_per_sqm', label: 'Lamination Rate', unit: 'PKR/sqm', description: 'Lamination finishing cost' },
  { key: 'embossing_rate_per_job', label: 'Embossing Rate', unit: 'PKR/job', description: 'Fixed cost for embossing' },
  { key: 'die_cutting_rate_per_1000', label: 'Die Cutting Rate', unit: 'PKR/1000', description: 'Die cutting cost per thousand' },
  { key: 'pre_press_simple', label: 'Pre-Press Simple', unit: 'PKR', description: 'Simple design pre-press cost' },
  { key: 'pre_press_medium', label: 'Pre-Press Medium', unit: 'PKR', description: 'Medium complexity pre-press' },
  { key: 'pre_press_complex', label: 'Pre-Press Complex', unit: 'PKR', description: 'Complex design pre-press cost' },
  { key: 'pre_press_rush', label: 'Pre-Press Rush', unit: 'PKR', description: 'Rush / urgent pre-press cost' },
];

export default function Costing() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: config, isLoading, error } = useQuery({
    queryKey: ['costing-config'],
    queryFn: fetchConfig,
  });

  const [form, setForm] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: saveConfig,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['costing-config'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  function getVal(key: string) {
    if (key in form) return form[key];
    return config ? String(config[key] ?? '') : '';
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Record<string, number> = {};
    for (const f of FIELDS) {
      const val = getVal(f.key);
      if (val !== '') payload[f.key] = parseFloat(val);
    }
    mutation.mutate(payload);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Costing</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Configure global cost rates used for quotation calculations
        </p>
      </div>

      {saved && (
        <Alert variant="success">
          Costing configuration saved successfully.
        </Alert>
      )}

      {mutation.isError && (
        <Alert variant="error">Failed to save configuration. Please try again.</Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" className="h-20" />)}
        </div>
      ) : error ? (
        <EmptyState icon={<AlertCircle />} title="Failed to load config" description="Check your connection and try again." />
      ) : (
        <form onSubmit={handleSubmit}>
          <Card variant="elevated" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--color-text-primary)]">Rate Configuration</h2>
                <p className="text-xs text-[var(--color-text-secondary)]">These rates are used to auto-calculate quotation costs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {FIELDS.map(f => (
                <div key={f.key}>
                  <Input
                    label={f.label}
                    type="number"
                    step="0.01"
                    min="0"
                    value={getVal(f.key)}
                    onChange={(e) => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    rightIcon={<span className="text-xs text-[var(--color-text-tertiary)] whitespace-nowrap">{f.unit}</span>}
                    helperText={f.description}
                    fullWidth
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                isLoading={mutation.isPending}
                icon={<Save className="w-4 h-4" />}
              >
                Save Configuration
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}
