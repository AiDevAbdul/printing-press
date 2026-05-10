'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { TrendingUp, FileText, Users, DollarSign, AlertCircle, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { dashboardService } from '@/lib/services/dashboard.service';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

function formatCurrency(n?: number) {
  if (!n) return '—';
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });
}

async function fetchRecentOrders() {
  const res = await fetch(`${API_BASE}/orders?limit=8&page=1`, { credentials: 'include' });
  if (!res.ok) return { data: [] };
  return res.json();
}

async function fetchRecentQuotations() {
  const res = await fetch(`${API_BASE}/quotations?limit=5&status=draft`, { credentials: 'include' });
  if (!res.ok) return { data: [] };
  return res.json();
}

export default function SalesDashboard() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardService.getStats });
  const { data: orders, isLoading: ordersLoading } = useQuery({ queryKey: ['sales-orders'], queryFn: fetchRecentOrders });
  const { data: quotations, isLoading: quotationsLoading } = useQuery({ queryKey: ['sales-quotations'], queryFn: fetchRecentQuotations });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Sales Dashboard</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Orders, quotations and revenue overview</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => router.push('/quotations/new')}>New Quote</Button>
          <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => router.push('/orders/new')}>New Order</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: statsLoading ? null : stats?.orders.total, icon: <FileText className="w-5 h-5 text-white" />, color: 'from-blue-500 to-blue-600' },
          { label: 'Pending', value: statsLoading ? null : stats?.orders.pending, icon: <TrendingUp className="w-5 h-5 text-white" />, color: 'from-orange-500 to-orange-600' },
          { label: 'In Production', value: statsLoading ? null : stats?.orders.in_production, icon: <TrendingUp className="w-5 h-5 text-white" />, color: 'from-green-500 to-green-600' },
          { label: 'Outstanding', value: statsLoading ? null : formatCurrency(stats?.pending_invoices_amount), icon: <DollarSign className="w-5 h-5 text-white" />, color: 'from-purple-500 to-purple-600', small: true },
        ].map((card, i) => (
          <Card key={i} variant="elevated" padding="md">
            <div className="flex items-start justify-between gap-2">
              <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shrink-0`}>{card.icon}</div>
              <div className="text-right">
                <p className="text-xs text-[var(--color-text-secondary)]">{card.label}</p>
                {statsLoading ? <Skeleton variant="text" className="h-8 w-16 mt-1" /> : (
                  <p className={`font-bold text-[var(--color-text-primary)] mt-1 ${card.small ? 'text-lg' : 'text-3xl'}`}>{card.value ?? 0}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" padding="none">
          <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-text-primary)]">Recent Orders</h2>
            <button onClick={() => router.push('/orders')} className="text-xs text-brand hover:underline">View all →</button>
          </div>
          {ordersLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="text" className="h-10" />)}</div>
          ) : (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {(orders?.data ?? []).slice(0, 6).map((o: any) => (
                <div key={o.id} onClick={() => router.push(`/orders/${o.id}`)} className="px-4 py-3 flex items-center justify-between hover:bg-[var(--color-border-subtle)] cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{o.product_name}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{o.order_number} · {o.customers?.name}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <Badge variant="status" status={o.status as any} dot>{o.status.replace(/_/g, ' ')}</Badge>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{formatDate(o.delivery_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card variant="elevated" padding="none">
          <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-text-primary)]">Draft Quotations</h2>
            <button onClick={() => router.push('/quotations')} className="text-xs text-brand hover:underline">View all →</button>
          </div>
          {quotationsLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="text" className="h-10" />)}</div>
          ) : !(quotations?.data?.length) ? (
            <div className="p-6 text-center text-sm text-[var(--color-text-secondary)]">No draft quotations</div>
          ) : (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {(quotations?.data ?? []).map((q: any) => (
                <div key={q.id} onClick={() => router.push(`/quotations/${q.id}`)} className="px-4 py-3 flex items-center justify-between hover:bg-[var(--color-border-subtle)] cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{q.product_name}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{q.quotation_number} · {q.customers?.name}</p>
                  </div>
                  <p className="text-xs text-[var(--color-text-tertiary)] shrink-0 ml-3">Valid: {formatDate(q.valid_until)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
