'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FileText, Receipt, Users, ClipboardList, Plus } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { StatusPill, StatusPillStatus } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { dashboardService } from '@/lib/services/dashboard.service';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });
}

function fmtPKR(n?: number) {
  if (!n) return '—';
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);
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

function orderStatusPill(status?: string) {
  const map: Record<string, [StatusPillStatus, string]> = {
    pending:       ['pending',     'Pending'],
    in_production: ['in_progress', 'In Production'],
    completed:     ['completed',   'Completed'],
    delivered:     ['completed',   'Delivered'],
    cancelled:     ['cancelled',   'Cancelled'],
  };
  const [s, l] = map[status ?? ''] ?? ['queued' as StatusPillStatus, status ?? '—'];
  return <StatusPill status={s} label={l} />;
}

export default function SalesDashboard() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardService.getStats });
  const { data: orders, isLoading: ordersLoading } = useQuery({ queryKey: ['sales-orders'], queryFn: fetchRecentOrders });
  const { data: quotations, isLoading: quotationsLoading } = useQuery({ queryKey: ['sales-quotations'], queryFn: fetchRecentQuotations });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">Sales Dashboard</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Orders, quotations, and revenue overview</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="secondary" onClick={() => router.push('/quotations/new')}>New Quotation</Button>
          <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => router.push('/orders/new')}>New Order</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" className="h-28" />) : (<>
          <StatCard
            label="Total Orders"
            value={stats?.orders?.total ?? 0}
            icon={<FileText />}
            accent="brand"
            href="/orders"
            badges={[
              ...(stats?.orders?.pending ? [{ label: `${stats.orders.pending} pending`, variant: 'warning' as const }] : []),
              ...(stats?.orders?.in_production ? [{ label: `${stats.orders.in_production} active`, variant: 'info' as const }] : []),
            ].slice(0, 2)}
          />
          <StatCard label="Pending Invoices" value={fmtPKR(stats?.pending_invoices_amount)} icon={<Receipt />} accent="warning" href="/invoices" />
          <StatCard label="Active Customers" value={stats?.customers?.total ?? 0} icon={<Users />} accent="info" href="/customers" />
          <StatCard label="Open Quotations" value={quotations?.total ?? 0} icon={<ClipboardList />} accent="brand" />
        </>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card variant="elevated" padding="none">
          <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--color-border-subtle)]">
            <CardTitle>Recent Orders</CardTitle>
            <button onClick={() => router.push('/orders')} className="text-xs text-[var(--color-brand)] hover:underline">View all →</button>
          </div>
          {ordersLoading ? (
            <div className="p-5 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)}</div>
          ) : !(orders?.data?.length) ? (
            <div className="px-5 py-8 text-center text-sm text-[var(--color-text-secondary)]">No recent orders</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  {['Order #', 'Customer', 'Product', 'Delivery', 'Status'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {orders.data.slice(0, 6).map((o: any) => (
                  <tr key={o.id} onClick={() => router.push(`/orders/${o.id}`)} className="hover:bg-[var(--color-brand-light)] cursor-pointer transition-colors">
                    <td className="px-5 py-4 font-mono text-sm font-semibold text-[var(--color-brand)]">{o.order_number}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">{o.customers?.name || '—'}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-primary)]">{o.product_name || '—'}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-tertiary)]">{o.delivery_date ? fmt(o.delivery_date) : '—'}</td>
                    <td className="px-5 py-4">{orderStatusPill(o.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card variant="elevated" padding="none">
          <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--color-border-subtle)]">
            <CardTitle>Draft Quotations</CardTitle>
            <button onClick={() => router.push('/quotations')} className="text-xs text-[var(--color-brand)] hover:underline">View all →</button>
          </div>
          {quotationsLoading ? (
            <div className="p-5 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)}</div>
          ) : !(quotations?.data?.length) ? (
            <div className="px-5 py-8 text-center text-sm text-[var(--color-text-secondary)]">No draft quotations</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  {['Quotation #', 'Customer', 'Product', 'Valid Until', 'Status'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {quotations.data.map((q: any) => (
                  <tr key={q.id} onClick={() => router.push(`/quotations/${q.id}`)} className="hover:bg-[var(--color-brand-light)] cursor-pointer transition-colors">
                    <td className="px-5 py-4 font-mono text-sm font-semibold text-[var(--color-brand)]">{q.quotation_number}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">{q.customers?.name || '—'}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-primary)]">{q.product_name || '—'}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-tertiary)]">{q.valid_until ? fmt(q.valid_until) : '—'}</td>
                    <td className="px-5 py-4"><StatusPill status="queued" label="Draft" /></td>
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
