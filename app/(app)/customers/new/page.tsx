'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { customersService, type Customer } from '@/lib/services/customers.service';

type FormData = {
  name: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  customer_group: string;
  customer_type: string;
  customer_type_custom: string;
  folder_name: string;
  ntn: string;
  strn: string;
  credit_limit: string;
  credit_days: string;
  payment_terms: string;
};

const CUSTOMER_TYPE_OPTIONS = ['Local', 'Export', 'Govt', 'Stamp'];

const EMPTY: FormData = {
  name: '', company_name: '', email: '', phone: '',
  address: '', city: '', state: '', postal_code: '',
  customer_group: '', customer_type: '', customer_type_custom: '',
  folder_name: '', ntn: '', strn: '',
  credit_limit: '0', credit_days: '30', payment_terms: '',
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

export default function NewCustomer() {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

  const isCustomType = form.customer_type === '__other__';

  const mutation = useMutation({
    mutationFn: (data: Partial<Customer>) => customersService.create(data),
    onSuccess: (customer) => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      router.push(`/customers/${customer.id}`);
    },
  });

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (isCustomType && !form.customer_type_custom.trim()) e.customer_type_custom = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const resolvedType = isCustomType ? form.customer_type_custom.trim() : form.customer_type;
    const payload: Partial<Customer> = {
      name: form.name,
      email: form.email,
      phone: form.phone,
    };
    if (form.company_name) payload.company_name = form.company_name;
    if (form.address) payload.address = form.address;
    if (form.city) payload.city = form.city;
    if (form.state) (payload as any).state = form.state;
    if (form.postal_code) (payload as any).postal_code = form.postal_code;
    if (form.customer_group) payload.customer_group = form.customer_group;
    if (resolvedType) payload.customer_type = resolvedType;
    if (form.folder_name) payload.folder_name = form.folder_name;
    if (form.ntn) payload.ntn = form.ntn;
    if (form.strn) payload.strn = form.strn;
    if (form.payment_terms) (payload as any).payment_terms = form.payment_terms;
    payload.credit_limit = parseFloat(form.credit_limit) || 0;
    payload.credit_days = parseInt(form.credit_days) || 30;
    mutation.mutate(payload);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/customers')}
          className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">New Customer</h1>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Add a new customer account</p>
        </div>
      </div>

      <Card variant="elevated" padding="lg">
        <CardHeader><CardTitle>Customer Details</CardTitle></CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label text="Full Name" required />
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ahmed Khan" fullWidth error={errors.name} />
            </div>
            <div>
              <Label text="Company Name" />
              <Input value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="e.g. ABC Pharma Ltd" fullWidth />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label text="Customer Type" />
              <div className="relative">
                <select
                  value={form.customer_type}
                  onChange={e => {
                    set('customer_type', e.target.value);
                    if (e.target.value !== '__other__') set('customer_type_custom', '');
                  }}
                  className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 pr-8 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors"
                >
                  <option value="">Select type…</option>
                  {CUSTOMER_TYPE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  <option value="__other__">Other…</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
              </div>
            </div>

            {isCustomType && (
              <div>
                <Label text="Specify Type" required />
                <Input
                  value={form.customer_type_custom}
                  onChange={e => set('customer_type_custom', e.target.value)}
                  placeholder="Enter customer type"
                  fullWidth
                  error={errors.customer_type_custom}
                />
              </div>
            )}

            <div>
              <Label text="Folder Name" />
              <Input
                value={form.folder_name}
                onChange={e => set('folder_name', e.target.value)}
                placeholder="Files folder name"
                fullWidth
              />
            </div>
          </div>

          <Divider title="Contact" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label text="Email" required />
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="ahmed@example.com" fullWidth error={errors.email} />
            </div>
            <div>
              <Label text="Phone" required />
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+92 300 1234567" fullWidth error={errors.phone} />
            </div>
            <div>
              <Label text="Address" />
              <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address" fullWidth />
            </div>
            <div>
              <Label text="City" />
              <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Karachi" fullWidth />
            </div>
            <div>
              <Label text="State / Province" />
              <Input value={form.state} onChange={e => set('state', e.target.value)} placeholder="e.g. Sindh" fullWidth />
            </div>
            <div>
              <Label text="Postal Code" />
              <Input value={form.postal_code} onChange={e => set('postal_code', e.target.value)} placeholder="75500" fullWidth />
            </div>
          </div>

          <Divider title="Business & Credit" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label text="Customer Group" />
              <Input value={form.customer_group} onChange={e => set('customer_group', e.target.value)} placeholder="e.g. Pharma, FMCG" fullWidth />
            </div>
            <div>
              <Label text="Payment Terms" />
              <Input value={form.payment_terms} onChange={e => set('payment_terms', e.target.value)} placeholder="e.g. Net 30" fullWidth />
            </div>
            <div>
              <Label text="Credit Limit (PKR)" />
              <Input type="number" value={form.credit_limit} onChange={e => set('credit_limit', e.target.value)} fullWidth />
            </div>
            <div>
              <Label text="Credit Days" />
              <Input type="number" value={form.credit_days} onChange={e => set('credit_days', e.target.value)} fullWidth />
            </div>
          </div>

          <Divider title="Tax Info (optional)" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label text="NTN" />
              <Input value={form.ntn} onChange={e => set('ntn', e.target.value)} placeholder="National Tax Number" fullWidth />
            </div>
            <div>
              <Label text="STRN" />
              <Input value={form.strn} onChange={e => set('strn', e.target.value)} placeholder="Sales Tax Registration" fullWidth />
            </div>
          </div>

          {mutation.isError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Failed to create customer. Please try again.
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-[var(--color-border-subtle)]">
            <Button onClick={handleSubmit} isLoading={mutation.isPending}>Create Customer</Button>
            <Button variant="ghost" onClick={() => router.push('/customers')}>Cancel</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
