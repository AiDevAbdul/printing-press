'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Package, Factory, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { dashboardService } from '@/lib/services/dashboard.service';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Analytics Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Cross-functional business overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats?.orders.total, icon: <Package className="w-5 h-5 text-white" />, color: 'from-blue-500 to-blue-600' },
          { label: 'Production Jobs', value: stats?.production_jobs.total, icon: <Factory className="w-5 h-5 text-white" />, color: 'from-green-500 to-green-600' },
          { label: 'Low Stock Items', value: stats?.low_stock_items, icon: <BarChart3 className="w-5 h-5 text-white" />, color: 'from-red-500 to-red-600' },
          { label: 'Completed Jobs', value: stats?.production_jobs.completed, icon: <TrendingUp className="w-5 h-5 text-white" />, color: 'from-purple-500 to-purple-600' },
        ].map((card, i) => (
          <Card key={i} variant="elevated" padding="md">
            <div className="flex items-start justify-between gap-2">
              <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shrink-0`}>{card.icon}</div>
              <div className="text-right">
                <p className="text-xs text-[var(--color-text-secondary)]">{card.label}</p>
                {statsLoading ? <Skeleton variant="text" className="h-8 w-12 mt-1" /> : (
                  <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">{card.value ?? 0}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card variant="elevated" padding="lg">
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />Revenue Trend
        </h2>
        {trendLoading ? (
          <Skeleton variant="card" className="h-48" />
        ) : !trendData.length ? (
          <div className="h-48 flex items-center justify-center text-sm text-[var(--color-text-secondary)]">
            No revenue data available
          </div>
        ) : (
          <div className="h-48 flex items-end gap-2">
            {trendData.map((point: any, i: number) => {
              const height = maxRevenue > 0 ? Math.max(4, Math.round((Number(point.revenue) / maxRevenue) * 100)) : 4;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-[10px] text-[var(--color-text-tertiary)] leading-none">
                    {point.revenue > 0 ? `${Math.round(Number(point.revenue) / 1000)}k` : ''}
                  </p>
                  <div className="w-full bg-brand rounded-t-sm" style={{ height: `${height}%` }} />
                  <p className="text-[10px] text-[var(--color-text-tertiary)] leading-none truncate w-full text-center">
                    {point.month || point.date || `M${i + 1}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Orders', sub: 'Completed', value: stats?.orders.completed, link: '/orders', color: 'text-blue-600' },
          { label: 'Production', sub: 'In Progress', value: stats?.production_jobs.in_progress, link: '/production', color: 'text-green-600' },
          { label: 'Quality', sub: 'Inspections', value: 0, link: '/quality', color: 'text-purple-600' },
        ].map((item, i) => (
          <Card key={i} variant="outlined" padding="md" hover onClick={() => router.push(item.link)} className="cursor-pointer">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">{item.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: item.color }}>{statsLoading ? '—' : item.value ?? 0}</p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{item.sub}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
