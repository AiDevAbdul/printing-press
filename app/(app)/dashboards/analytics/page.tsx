'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Package, Factory, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
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

async function fetchRevenueTrend() {
  const res = await fetch(`${API_BASE}/dashboard?endpoint=revenue-trend`, { credentials: 'include' });
  if (!res.ok) return [];
  return res.json();
}

export default function AnalyticsDashboard() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardService.getStats });
  const { data: trend, isLoading: trendLoading } = useQuery({ queryKey: ['revenue-trend'], queryFn: fetchRevenueTrend });

  const trendData: any[] = Array.isArray(trend) ? trend : [];
  const maxRevenue = trendData.length > 0 ? Math.max(...trendData.map(t => Number(t.revenue) || 0), 1) : 1;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">Analytics</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Cross-functional business overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" className="h-28" />) : (<>
          <StatCard label="Total Orders" value={stats?.orders?.total ?? 0} icon={<Package />} accent="brand" href="/orders" />
          <StatCard label="Production Jobs" value={stats?.production_jobs?.total ?? 0} icon={<Factory />} accent="info" href="/production" />
          <StatCard label="Low Stock" value={stats?.low_stock_items ?? 0} icon={<AlertTriangle />} accent="danger" />
          <StatCard label="Completed Jobs" value={stats?.production_jobs?.completed ?? 0} icon={<CheckCircle2 />} accent="success" />
        </>)}
      </div>

      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        {trendLoading ? (
          <Skeleton variant="card" className="h-40" />
        ) : !trendData.length ? (
          <EmptyState title="No revenue data" description="Revenue trend data will appear here once orders are invoiced" />
        ) : (
          <div className="flex items-end gap-1 h-40">
            {trendData.map((t, i) => {
              const pct = (Number(t.revenue) || 0) / maxRevenue * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <span className="text-[9px] text-[var(--color-text-tertiary)] truncate">{fmtPKR(t.revenue)}</span>
                  <div className="w-full rounded-t-md" style={{ height: `${Math.max(pct, 2)}%`, backgroundColor: 'var(--color-brand)', opacity: 0.8 + (i / trendData.length) * 0.2 }} />
                  <span className="text-[9px] text-[var(--color-text-tertiary)] truncate">{fmt(t.date)}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        {statsLoading ? (
          <Skeleton variant="card" className="h-24" />
        ) : (
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            {[
              { label: 'Total Orders',    value: stats?.orders?.total ?? 0 },
              { label: 'In Production',   value: stats?.production_jobs?.in_progress ?? 0 },
              { label: 'Queued Jobs',     value: stats?.production_jobs?.queued ?? 0 },
              { label: 'Completed Jobs',  value: stats?.production_jobs?.completed ?? 0 },
              { label: 'Low Stock Items', value: stats?.low_stock_items ?? 0 },
              { label: 'Pending Orders',  value: stats?.orders?.pending ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-0.5">
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">{label}</dt>
                <dd className="text-2xl font-bold text-[var(--color-text-primary)] tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Card>
    </div>
  );
}
