'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, User, Building2, Mail, Phone, MapPin,
  AlertCircle, Edit3, Check, X, CreditCard, FileText,
  ShieldCheck, Hash,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/Input';
import { customersService, type Customer } from '@/lib/services/customers.service';

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtCurrency(n?: number) {
  if (n === undefined || n === null) return '—';
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="text-[var(--color-text-tertiary)] mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">{label}</p>
        <p className="text-sm text-[var(--color-text-primary)] mt-0.5">{String(value)}</p>
      </div>
    </div>
  );
}

function SpecField({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-0.5">{label}</dt>
      <dd className="text-sm text-[var(--color-text-primary)]">{String(value)}</dd>
    </div>
  );
}

export default function CustomerDetail() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Customer>>({});

  const { data: customer, isLoading, error } = useQuery<Customer>({
    queryKey: ['customer', id],
    queryFn: () => customersService.getById(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Customer>) => customersService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer', id] });
      qc.invalidateQueries({ queryKey: ['customers'] });
      setEditing(false);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: () => customersService.update(id, { is_active: !customer?.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer', id] }),
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl space-y-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
          <Skeleton variant="card" className="h-72" />
          <div className="space-y-4">
            <Skeleton variant="card" className="h-48" />
            <Skeleton variant="card" className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-10 h-10 text-[var(--color-danger)]" />
        <p className="text-[var(--color-text-secondary)]">Customer not found.</p>
        <Button variant="ghost" onClick={() => router.push('/customers')}>Back to Customers</Button>
      </div>
    );
  }

  function startEdit() {
    setDraft({
      name: customer!.name,
      company_name: customer!.company_name,
      email: customer!.email,
      phone: customer!.phone,
      address: customer!.address,
      city: customer!.city,
      credit_limit: customer!.credit_limit,
      credit_days: customer!.credit_days,
    });
    setEditing(true);
  }

  return (
    <div className="max-w-5xl space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push('/customers')}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Customers
        </button>
        <span className="text-[var(--color-border)] text-sm">/</span>
        <span className="text-sm text-[var(--color-text-secondary)]">{customer.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 items-start">
        {/* ── Left sidebar ── */}
        <div className="space-y-4 lg:sticky lg:top-6">
          <Card variant="elevated" padding="none" className="overflow-hidden">
            <div className="h-1.5 w-full" style={{ background: 'var(--color-brand)' }} />
            <div className="p-5 space-y-4">
              {/* Avatar + name */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[var(--color-brand-light)] flex items-center justify-center flex-shrink-0">
                    <span className="text-[var(--color-brand)] text-base font-bold">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-base font-bold text-[var(--color-text-primary)] leading-tight truncate">
                      {customer.name}
                    </h1>
                    {customer.company_name && (
                      <p className="text-xs text-[var(--color-text-secondary)] truncate">{customer.company_name}</p>
                    )}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 ${
                    customer.is_active
                      ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
                      : 'bg-[var(--color-border-subtle)] text-[var(--color-text-tertiary)]'
                  }`}
                >
                  {customer.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="border-t border-[var(--color-border-subtle)]" />

              {/* Contact info */}
              <div className="space-y-3">
                <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={customer.email} />
                <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={customer.phone} />
                {(customer.address || customer.city) && (
                  <InfoRow
                    icon={<MapPin className="w-3.5 h-3.5" />}
                    label="Address"
                    value={[customer.address, customer.city].filter(Boolean).join(', ')}
                  />
                )}
              </div>

              <div className="border-t border-[var(--color-border-subtle)]" />

              {/* Credit */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span className="text-xs">Credit Limit</span>
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {fmtCurrency(customer.credit_limit)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="text-xs">Credit Days</span>
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {customer.credit_days} days
                  </span>
                </div>
              </div>

              <div className="border-t border-[var(--color-border-subtle)]" />

              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1 text-xs" onClick={startEdit} icon={<Edit3 className="w-3.5 h-3.5" />}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 text-xs"
                  isLoading={toggleActiveMutation.isPending}
                  onClick={() => toggleActiveMutation.mutate()}
                >
                  {customer.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1">
              Member since
            </p>
            <p className="text-sm text-[var(--color-text-primary)]">{fmt(customer.created_at)}</p>
          </Card>
        </div>

        {/* ── Right: details ── */}
        <div className="space-y-4">
          {/* Edit form */}
          {editing && (
            <Card variant="elevated" padding="lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Edit Customer</CardTitle>
                  <button onClick={() => setEditing(false)} className="p-1 rounded text-[var(--color-text-tertiary)] hover:bg-[var(--color-border-subtle)]">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1.5">Name *</label>
                    <Input value={draft.name || ''} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} fullWidth />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1.5">Company</label>
                    <Input value={draft.company_name || ''} onChange={e => setDraft(d => ({ ...d, company_name: e.target.value }))} fullWidth />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1.5">Email</label>
                    <Input type="email" value={draft.email || ''} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} fullWidth />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1.5">Phone</label>
                    <Input value={draft.phone || ''} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} fullWidth />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1.5">Address</label>
                    <Input value={draft.address || ''} onChange={e => setDraft(d => ({ ...d, address: e.target.value }))} fullWidth />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1.5">City</label>
                    <Input value={draft.city || ''} onChange={e => setDraft(d => ({ ...d, city: e.target.value }))} fullWidth />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1.5">Credit Limit (PKR)</label>
                    <Input type="number" value={draft.credit_limit ?? ''} onChange={e => setDraft(d => ({ ...d, credit_limit: parseFloat(e.target.value) || 0 }))} fullWidth />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-1.5">Credit Days</label>
                    <Input type="number" value={draft.credit_days ?? ''} onChange={e => setDraft(d => ({ ...d, credit_days: parseInt(e.target.value) || 0 }))} fullWidth />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => updateMutation.mutate(draft)} isLoading={updateMutation.isPending} icon={<Check className="w-4 h-4" />}>
                    Save Changes
                  </Button>
                  <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Business Details */}
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[var(--color-brand)]" />
                <CardTitle>Business Details</CardTitle>
              </div>
            </CardHeader>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
              <SpecField label="Customer Group" value={customer.customer_group} />
              <SpecField label="NTN" value={customer.ntn} />
              <SpecField label="STRN" value={customer.strn} />
              <SpecField label="Credit Limit" value={fmtCurrency(customer.credit_limit)} />
              <SpecField label="Credit Days" value={`${customer.credit_days} days`} />
              <SpecField label="Member Since" value={fmt(customer.created_at)} />
            </dl>
          </Card>

          {/* Tax & Compliance */}
          {(customer.ntn || customer.strn) && (
            <Card variant="elevated" padding="lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-brand)]" />
                  <CardTitle>Tax & Compliance</CardTitle>
                </div>
              </CardHeader>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
                <SpecField label="NTN" value={customer.ntn} />
                <SpecField label="STRN" value={customer.strn} />
              </dl>
            </Card>
          )}

          {/* Quick links */}
          <Card variant="elevated" padding="md">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-3">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" className="text-xs" onClick={() => router.push(`/orders?customer=${id}`)}>
                View Orders
              </Button>
              <Button variant="secondary" className="text-xs" onClick={() => router.push(`/quotations?customer=${id}`)}>
                View Quotations
              </Button>
              <Button variant="secondary" className="text-xs" onClick={() => router.push(`/invoices?customer=${id}`)}>
                View Invoices
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
