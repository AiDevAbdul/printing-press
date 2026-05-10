'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Package, Factory, AlertTriangle, FileText, AlertCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/ui/StatCard';
import { StatusPill, type StatusPillStatus } from '@/components/ui/StatusPill';
import { dashboardService } from '@/lib/services/dashboard.service';
import { formatCurrency } from '@/lib/formatters';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function fetchRecentOrders() {
  const res = await fetch(`${API_BASE}/orders?limit=6&page=1`, { credentials: 'include' });
  if (!res.ok) return { data: [] };
  return res.json();
}

function orderStatusToPill(s: string): { status: StatusPillStatus; label: string } {
  switch (s) {
    case 'pending':       return { status: 'pending',    label: 'Pending' };
    case 'approved':      return { status: 'approved',   label: 'Approved' };
    case 'in_production': return { status: 'in_progress',label: 'In Production' };
    case 'completed':     return { status: 'completed',  label: 'Completed' };
    case 'delivered':     return { status: 'completed',  label: 'Delivered' };
    case 'cancelled':     return { status: 'cancelled',  label: 'Cancelled' };
    default:              return { status: 'queued',     label: s };
  }
}

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const router = useRouter();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  const { data: productionStatus, isLoading: productionLoading } = useQuery({
    queryKey: ['production-status'],
    queryFn: dashboardService.getProductionStatus,
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['dashboard-recent-orders'],
    queryFn: fetchRecentOrders,
  });

  if (statsLoading || productionLoading) {
    return (
      <div className="space-y-5">
        <Skeleton variant="text" className="h-10 w-72" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <Skeleton key={i} variant="card" className="h-32" />)}
        </div>
        <Skeleton variant="card" className="h-52" />
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  if (statsError) {
    return <EmptyState icon={<AlertCircle />} title="Error loading dashboard" description="Check your connection and try again." />;
  }

  const today = new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">{greeting()}</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{today}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={stats?.orders.total ?? 0}
          icon={<Package />}
          accent="brand"
          href="/orders"
          badges={[
            { label: `${stats?.orders.pending ?? 0} pending`, variant: 'warning' },
            { label: `${stats?.orders.in_production ?? 0} active`, variant: 'info' },
          ]}
        />
        <StatCard
          label="Production Jobs"
          value={stats?.production_jobs.total ?? 0}
          icon={<Factory />}
          accent="success"
          href="/production"
          badges={[
            { label: `${productionStatus?.in_progress ?? 0} running`, variant: 'success' },
            { label: `${stats?.production_jobs.queued ?? 0} queued`, variant: 'warning' },
          ]}
        />
        <StatCard
          label="Low Stock Alerts"
          value={stats?.low_stock_items ?? 0}
          icon={<AlertTriangle />}
          accent={(stats?.low_stock_items ?? 0) > 0 ? 'danger' : 'success'}
          href="/dashboards/inventory"
          badges={[{ label: (stats?.low_stock_items ?? 0) > 0 ? 'Needs reordering' : 'All stocked', variant: (stats?.low_stock_items ?? 0) > 0 ? 'danger' : 'success' }]}
        />
        <StatCard
          label="Pending Invoices"
          value={formatCurrency(stats?.pending_invoices_amount ?? 0)}
          icon={<FileText />}
          accent="warning"
          href="/invoices"
          badges={[{ label: 'Outstanding', variant: 'warning' }]}
        />
      </div>

      {/* Production overview */}
      {productionStatus && (
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Production Overview</CardTitle>
              <button
                onClick={() => router.push('/production')}
                className="text-xs font-semibold text-[var(--color-brand)] hover:underline"
              >
                View all →
              </button>
            </div>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                count: productionStatus.in_progress ?? 0,
                label: 'In Progress',
                sub: 'Active jobs on floor',
                accent: 'var(--color-success)',
                bg: 'var(--color-success-bg)',
              },
              {
                count: productionStatus.scheduled_today ?? 0,
                label: 'Scheduled Today',
                sub: 'Starting today',
                accent: 'var(--color-info)',
                bg: 'var(--color-info-bg)',
              },
              {
                count: productionStatus.overdue ?? 0,
                label: 'Overdue',
                sub: 'Needs attention',
                accent: 'var(--color-danger)',
                bg: 'var(--color-danger-bg)',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 p-4 rounded-xl border"
                style={{ background: item.bg, borderColor: item.accent + '33' }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                  style={{ background: item.accent }}
                >
                  {item.count}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent orders */}
      <Card variant="elevated" padding="none">
        <div className="px-5 py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Recent Orders</h2>
          <button onClick={() => router.push('/orders')} className="text-xs font-semibold text-[var(--color-brand)] hover:underline">
            View all →
          </button>
        </div>
        {ordersLoading ? (
          <div className="p-5 space-y-3">{[0,1,2].map(i => <Skeleton key={i} variant="text" className="h-12" />)}</div>
        ) : !recentOrders?.data?.length ? (
          <div className="p-6"><EmptyState icon={<Package />} title="No orders yet" description="Create your first order to get started." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  {['Order', 'Customer', 'Product', 'Delivery', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.data.map((o: any) => {
                  const pill = orderStatusToPill(o.status);
                  const overdue = !['delivered','completed','cancelled'].includes(o.status) && new Date(o.delivery_date) < new Date();
                  return (
                    <tr
                      key={o.id}
                      onClick={() => router.push(`/orders/${o.id}`)}
                      className="border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-brand-light)] cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-[var(--color-brand)] font-semibold">{o.order_number}</td>
                      <td className="px-5 py-3 text-[var(--color-text-primary)]">{o.customers?.name ?? '—'}</td>
                      <td className="px-5 py-3 text-[var(--color-text-secondary)] max-w-[180px] truncate">{o.product_name}</td>
                      <td className="px-5 py-3">
                        <span className={overdue ? 'text-[var(--color-danger)] font-medium flex items-center gap-1' : 'text-[var(--color-text-secondary)]'}>
                          {overdue && <Clock className="w-3 h-3" />}{fmt(o.delivery_date)}
                        </span>
                      </td>
                      <td className="px-5 py-3"><StatusPill status={pill.status} label={pill.label} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
