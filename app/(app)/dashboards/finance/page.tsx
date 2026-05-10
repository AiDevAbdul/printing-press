'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Receipt, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { dashboardService } from '@/lib/services/dashboard.service';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

function formatCurrency(n?: number) {
  if (n === undefined || n === null) return '—';
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });
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

export default function FinanceDashboard() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardService.getStats });
  const { data: overdue, isLoading: overdueLoading } = useQuery({ queryKey: ['overdue-invoices'], queryFn: fetchOverdueInvoices });
  const { data: recent, isLoading: recentLoading } = useQuery({ queryKey: ['recent-invoices'], queryFn: fetchRecentInvoices });

  const totalRevenue = recent?.data?.reduce((s: number, i: any) => s + Number(i.paid_amount), 0) ?? 0;
  const totalOutstanding = recent?.data?.reduce((s: number, i: any) => s + Number(i.balance_amount), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Finance Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Revenue, invoices, and accounts receivable</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Outstanding Invoices', value: statsLoading ? null : formatCurrency(stats?.pending_invoices_amount), icon: <Receipt className="w-5 h-5 text-white" />, color: 'from-red-500 to-red-600', small: true },
          { label: 'Paid (Page)', value: recentLoading ? null : formatCurrency(totalRevenue), icon: <DollarSign className="w-5 h-5 text-white" />, color: 'from-green-500 to-green-600', small: true },
          { label: 'Balance (Page)', value: recentLoading ? null : formatCurrency(totalOutstanding), icon: <TrendingUp className="w-5 h-5 text-white" />, color: 'from-blue-500 to-blue-600', small: true },
          { label: 'Overdue', value: overdueLoading ? null : overdue?.data?.length ?? 0, icon: <AlertTriangle className="w-5 h-5 text-white" />, color: 'from-orange-500 to-orange-600' },
        ].map((card, i) => (
          <Card key={i} variant="elevated" padding="md">
            <div className="flex items-start justify-between gap-2">
              <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shrink-0`}>{card.icon}</div>
              <div className="text-right">
                <p className="text-xs text-[var(--color-text-secondary)]">{card.label}</p>
                {(statsLoading || (i > 0 && recentLoading) || (i === 3 && overdueLoading))
                  ? <Skeleton variant="text" className="h-7 w-20 mt-1" />
                  : <p className={`font-bold text-[var(--color-text-primary)] mt-1 ${card.small ? 'text-lg' : 'text-3xl'}`}>{card.value ?? 0}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" padding="none">
          <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-danger" />Overdue Invoices
            </h2>
            <button onClick={() => router.push('/invoices?status=overdue')} className="text-xs text-brand hover:underline">View all →</button>
          </div>
          {overdueLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="text" className="h-10" />)}</div>
          ) : !(overdue?.data?.length) ? (
            <div className="p-6 text-center text-sm text-success">No overdue invoices</div>
          ) : (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {overdue.data.map((inv: any) => (
                <div key={inv.id} onClick={() => router.push(`/invoices/${inv.id}`)} className="px-4 py-3 flex items-center justify-between hover:bg-[var(--color-border-subtle)] cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{inv.customers?.name || '—'}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{inv.invoice_number} · Due {formatDate(inv.due_date)}</p>
                  </div>
                  <p className="text-sm font-semibold text-danger shrink-0 ml-3">{formatCurrency(Number(inv.balance_amount))}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card variant="elevated" padding="none">
          <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-text-primary)]">Recent Invoices</h2>
            <button onClick={() => router.push('/invoices')} className="text-xs text-brand hover:underline">View all →</button>
          </div>
          {recentLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="text" className="h-10" />)}</div>
          ) : (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {(recent?.data ?? []).slice(0, 6).map((inv: any) => (
                <div key={inv.id} onClick={() => router.push(`/invoices/${inv.id}`)} className="px-4 py-3 flex items-center justify-between hover:bg-[var(--color-border-subtle)] cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{inv.customers?.name || '—'}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{inv.invoice_number}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <Badge variant="status" status={inv.status as any}>{inv.status}</Badge>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">{formatCurrency(Number(inv.total_amount))}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
