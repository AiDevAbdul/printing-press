'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Package, AlertTriangle, CheckCircle2, Factory } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { dashboardService } from '@/lib/services/dashboard.service';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function fetchLowStock() {
  const res = await fetch(`${API_BASE}/inventory?low_stock=true&limit=20`, { credentials: 'include' });
  if (!res.ok) return { data: [] };
  return res.json();
}

async function fetchInventory() {
  const res = await fetch(`${API_BASE}/inventory?limit=10`, { credentials: 'include' });
  if (!res.ok) return { data: [], total: 0 };
  return res.json();
}

export default function InventoryDashboard() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardService.getStats });
  const { data: lowStock, isLoading: lowStockLoading } = useQuery({ queryKey: ['low-stock'], queryFn: fetchLowStock });
  const { data: inventory, isLoading: invLoading } = useQuery({ queryKey: ['inv-list'], queryFn: fetchInventory });

  const inStockCount = Math.max(0, (inventory?.total ?? 0) - (stats?.low_stock_items ?? 0));
  const loading = statsLoading || invLoading;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">Inventory Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Stock levels and reorder alerts</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" className="h-28" />) : (<>
          <StatCard label="Total Items" value={inventory?.total ?? 0} icon={<Package />} accent="brand" href="/inventory" />
          <StatCard label="Low Stock" value={stats?.low_stock_items ?? 0} icon={<AlertTriangle />} accent="danger" />
          <StatCard label="In Stock" value={inStockCount} icon={<CheckCircle2 />} accent="success" />
          <StatCard label="Production Jobs" value={stats?.production_jobs?.total ?? 0} icon={<Factory />} accent="info" href="/production" />
        </>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card variant="elevated" padding="none">
          <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--color-border-subtle)]">
            <CardTitle>Low Stock Alerts</CardTitle>
            <button onClick={() => router.push('/inventory')} className="text-xs text-[var(--color-brand)] hover:underline">Manage →</button>
          </div>
          {lowStockLoading ? (
            <div className="p-5 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)}</div>
          ) : !(lowStock?.data?.length) ? (
            <EmptyState title="All stocked up" description="No items below reorder level" className="py-8" />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  {['Item Name', 'Category', 'Qty', 'Reorder Level'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {lowStock.data.slice(0, 8).map((item: any) => (
                  <tr key={item.id} onClick={() => router.push('/inventory')} className="hover:bg-[var(--color-brand-light)] cursor-pointer transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-[var(--color-text-primary)]">{item.item_name}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)] capitalize">{item.category?.replace(/_/g, ' ') || '—'}</td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: 'var(--color-danger)' }}>
                      {Number(item.current_stock)} {item.unit}
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-tertiary)]">{Number(item.reorder_level)} {item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card variant="elevated" padding="none">
          <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--color-border-subtle)]">
            <CardTitle>Inventory Overview</CardTitle>
            <button onClick={() => router.push('/inventory')} className="text-xs text-[var(--color-brand)] hover:underline">View all →</button>
          </div>
          {invLoading ? (
            <div className="p-5 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)}</div>
          ) : !(inventory?.data?.length) ? (
            <div className="px-5 py-8 text-center text-sm text-[var(--color-text-secondary)]">No inventory items</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  {['Item Name', 'Category', 'Quantity', 'Unit'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {inventory.data.map((item: any) => (
                  <tr key={item.id} onClick={() => router.push('/inventory')} className="hover:bg-[var(--color-brand-light)] cursor-pointer transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-[var(--color-text-primary)]">{item.item_name}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)] capitalize">{item.category?.replace(/_/g, ' ') || '—'}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-primary)]">{Number(item.current_stock)}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-tertiary)]">{item.unit || '—'}</td>
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
