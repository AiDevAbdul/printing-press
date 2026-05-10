'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { DollarSign, Receipt, AlertTriangle, FileText } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { StatusPill, StatusPillStatus } from '@/components/ui/StatusPill';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { dashboardService } from '@/lib/services/dashboard.service';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });
}

function fmtPKR(n?: number) {
  if (!n) return '—';
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);
}

async function fetchOverdueInvoices() {
  const res = await fetch(`${API_BASE}/invoices?status=overdue&limit=8`, { credentials: 'include' });
  if (!res.ok) return { data: [] };
  return res.json();
}

async function fetchRecentInvoices() {
  const res = await fetch(`${API_BASE}/invoices?limit=8`, { credentials: 'include' });
  if (!res.ok) return { data: [] };
  return res.json();
}

function invoiceStatusPill(status?: string) {
  const map: Record<string, [StatusPillStatus, string]> = {
    draft:     ['queued',     'Draft'],
    sent:      ['pending',    'Sent'],
    paid:      ['completed',  'Paid'],
    overdue:   ['blocked',    'Overdue'],
    cancelled: ['cancelled',  'Cancelled'],
  };
  const [s, l] = map[status ?? ''] ?? ['queued' as StatusPillStatus, status ?? '—'];
  return <StatusPill status={s} label={l} />;
}

export default function FinanceDashboard() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardService.getStats });
  const { data: overdue, isLoading: overdueLoading } = useQuery({ queryKey: ['overdue-invoices'], queryFn: fetchOverdueInvoices });
  const { data: recent, isLoading: recentLoading } = useQuery({ queryKey: ['recent-invoices'], queryFn: fetchRecentInvoices });

  const totalRevenue = recent?.data?.reduce((s: number, i: any) => s + Number(i.paid_amount), 0) ?? 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">Finance Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Invoices, revenue, and payment tracking</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(statsLoading || recentLoading || overdueLoading) ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" className="h-28" />) : (<>
          <StatCard label="Total Revenue" value={fmtPKR(totalRevenue)} icon={<DollarSign />} accent="success" />
          <StatCard label="Pending Invoices" value={fmtPKR(stats?.pending_invoices_amount)} icon={<Receipt />} accent="warning" href="/invoices" />
          <StatCard label="Overdue Count" value={overdue?.data?.length ?? 0} icon={<AlertTriangle />} accent="danger" />
          <StatCard label="Total Orders" value={stats?.orders?.total ?? 0} icon={<FileText />} accent="brand" href="/orders" />
        </>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card variant="elevated" padding="none">
          <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--color-border-subtle)]">
            <CardTitle>Overdue Invoices</CardTitle>
            <button onClick={() => router.push('/invoices?status=overdue')} className="text-xs text-[var(--color-brand)] hover:underline">View all →</button>
          </div>
          {overdueLoading ? (
            <div className="p-5 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)}</div>
          ) : !(overdue?.data?.length) ? (
            <EmptyState title="No overdue invoices" description="Payments are on track" className="py-8" />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  {['Invoice #', 'Customer', 'Amount', 'Due Date'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {overdue.data.map((i: any) => (
                  <tr key={i.id} onClick={() => router.push(`/invoices/${i.id}`)} className="hover:bg-[var(--color-brand-light)] cursor-pointer transition-colors">
                    <td className="px-5 py-4 font-mono text-sm font-semibold text-[var(--color-brand)]">{i.invoice_number}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-primary)]">{i.customers?.name || '—'}</td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: 'var(--color-danger)' }}>{fmtPKR(Number(i.balance_amount))}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-tertiary)]">{i.due_date ? fmt(i.due_date) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card variant="elevated" padding="none">
          <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--color-border-subtle)]">
            <CardTitle>Recent Invoices</CardTitle>
            <button onClick={() => router.push('/invoices')} className="text-xs text-[var(--color-brand)] hover:underline">View all →</button>
          </div>
          {recentLoading ? (
            <div className="p-5 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)}</div>
          ) : !(recent?.data?.length) ? (
            <div className="px-5 py-8 text-center text-sm text-[var(--color-text-secondary)]">No recent invoices</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  {['Invoice #', 'Customer', 'Amount', 'Paid', 'Status'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {recent.data.slice(0, 6).map((i: any) => (
                  <tr key={i.id} onClick={() => router.push(`/invoices/${i.id}`)} className="hover:bg-[var(--color-brand-light)] cursor-pointer transition-colors">
                    <td className="px-5 py-4 font-mono text-sm font-semibold text-[var(--color-brand)]">{i.invoice_number}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-primary)]">{i.customers?.name || '—'}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">{fmtPKR(Number(i.total_amount))}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">{fmtPKR(Number(i.paid_amount))}</td>
                    <td className="px-5 py-4">{invoiceStatusPill(i.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
