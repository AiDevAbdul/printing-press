'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Package, AlertTriangle, BarChart2, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Inventory Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Stock levels and reorder alerts</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: invLoading ? null : inventory?.total, icon: <Package className="w-5 h-5 text-white" />, color: 'from-blue-500 to-blue-600' },
          { label: 'Low Stock Alert', value: statsLoading ? null : stats?.low_stock_items, icon: <AlertTriangle className="w-5 h-5 text-white" />, color: 'from-red-500 to-red-600' },
          { label: 'Categories', value: invLoading ? null : new Set(inventory?.data?.map((i: any) => i.category)).size, icon: <BarChart2 className="w-5 h-5 text-white" />, color: 'from-purple-500 to-purple-600' },
          { label: 'Zero Stock', value: invLoading ? null : inventory?.data?.filter((i: any) => Number(i.current_stock) === 0).length, icon: <TrendingDown className="w-5 h-5 text-white" />, color: 'from-orange-500 to-orange-600' },
        ].map((card, i) => (
          <Card key={i} variant="elevated" padding="md">
            <div className="flex items-start justify-between gap-2">
              <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shrink-0`}>{card.icon}</div>
              <div className="text-right">
                <p className="text-xs text-[var(--color-text-secondary)]">{card.label}</p>
                {(statsLoading || invLoading) ? <Skeleton variant="text" className="h-8 w-12 mt-1" /> : (
                  <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">{card.value ?? 0}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" padding="none">
          <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-danger" />Low Stock Items
            </h2>
            <button onClick={() => router.push('/inventory')} className="text-xs text-brand hover:underline">Manage inventory →</button>
          </div>
          {lowStockLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="text" className="h-10" />)}</div>
          ) : !(lowStock?.data?.length) ? (
            <div className="p-6 text-center text-sm text-success">All items above reorder level</div>
          ) : (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {lowStock.data.slice(0, 8).map((item: any) => {
                const pct = item.reorder_level > 0 ? Math.min(100, Math.round((Number(item.current_stock) / Number(item.reorder_level)) * 100)) : 0;
                return (
                  <div key={item.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.item_name}</p>
                        <p className="text-xs text-[var(--color-text-tertiary)]">{item.item_code} · {item.category}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-semibold text-danger">{Number(item.current_stock)} {item.unit}</p>
                        <p className="text-xs text-[var(--color-text-tertiary)]">Min: {Number(item.reorder_level)}</p>
                      </div>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-[var(--color-border-subtle)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-danger" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card variant="elevated" padding="none">
          <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-text-primary)]">Recent Items</h2>
            <button onClick={() => router.push('/inventory')} className="text-xs text-brand hover:underline">View all →</button>
          </div>
          {invLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="text" className="h-10" />)}</div>
          ) : !(inventory?.data?.length) ? (
            <div className="p-6 text-center text-sm text-[var(--color-text-secondary)]">No inventory items</div>
          ) : (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {inventory.data.map((item: any) => (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.item_name}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)] capitalize">{item.category?.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{Number(item.current_stock)} {item.unit}</p>
                    <Badge variant={Number(item.current_stock) <= Number(item.reorder_level) ? 'warning' : 'success'}>
                      {Number(item.current_stock) <= Number(item.reorder_level) ? 'Low' : 'OK'}
                    </Badge>
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
