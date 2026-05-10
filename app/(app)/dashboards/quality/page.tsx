'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function fetchInspections(status?: string) {
  const q = new URLSearchParams({ limit: '10' });
  if (status) q.set('status', status);
  const res = await fetch(`${API_BASE}/quality?${q}`, { credentials: 'include' });
  if (!res.ok) return { data: [], total: 0 };
  return res.json();
}

async function fetchDefects() {
  const res = await fetch(`${API_BASE}/quality?status=failed&limit=8`, { credentials: 'include' });
  if (!res.ok) return { data: [], total: 0 };
  return res.json();
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });
}

export default function QualityDashboard() {
  const router = useRouter();
  const { data: all, isLoading: allLoading } = useQuery({ queryKey: ['qd-all'], queryFn: () => fetchInspections() });
  const { data: pending, isLoading: pendingLoading } = useQuery({ queryKey: ['qd-pending'], queryFn: () => fetchInspections('pending') });
  const { data: passed, isLoading: passedLoading } = useQuery({ queryKey: ['qd-passed'], queryFn: () => fetchInspections('passed') });
  const { data: failed, isLoading: failedLoading } = useQuery({ queryKey: ['qd-failed'], queryFn: fetchDefects });

  const passRate = (all?.total && passed?.total)
    ? Math.round((passed.total / all.total) * 100)
    : null;

  const loading = allLoading || pendingLoading || passedLoading || failedLoading;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">Quality Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Inspection results and defect tracking</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" className="h-28" />) : (<>
          <StatCard label="Total Inspections" value={all?.total ?? 0} icon={<ShieldCheck />} accent="brand" href="/quality" />
          <StatCard label="Pass Rate" value={passRate != null ? `${passRate}%` : '—'} icon={<CheckCircle2 />} accent="success" />
          <StatCard label="Pending" value={pending?.total ?? 0} icon={<Clock />} accent="warning" href="/quality" />
          <StatCard label="Failed" value={failed?.total ?? 0} icon={<XCircle />} accent="danger" />
        </>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card variant="elevated" padding="none">
          <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--color-border-subtle)]">
            <CardTitle>Pending Inspections</CardTitle>
            <button onClick={() => router.push('/quality')} className="text-xs text-[var(--color-brand)] hover:underline">View all →</button>
          </div>
          {pendingLoading ? (
            <div className="p-5 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)}</div>
          ) : !(pending?.data?.length) ? (
            <EmptyState title="No pending inspections" description="All caught up" className="py-8" />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  {['Job #', 'Product', 'Order Ref', 'Date'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {pending.data.map((ins: any) => (
                  <tr key={ins.id} onClick={() => router.push(`/quality/${ins.id}`)} className="hover:bg-[var(--color-brand-light)] cursor-pointer transition-colors">
                    <td className="px-5 py-4 font-mono text-sm font-semibold text-[var(--color-text-primary)]">{ins.inspection_number || ins.id?.slice(0, 8)}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">{ins.product_name || ins.production_jobs?.product_name || '—'}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">{ins.order_number || '—'}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-tertiary)]">{ins.created_at ? fmt(ins.created_at) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card variant="elevated" padding="none">
          <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--color-border-subtle)]">
            <CardTitle>Recent Failures</CardTitle>
            <button onClick={() => router.push('/quality')} className="text-xs text-[var(--color-brand)] hover:underline">View all →</button>
          </div>
          {failedLoading ? (
            <div className="p-5 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)}</div>
          ) : !(failed?.data?.length) ? (
            <EmptyState title="No recent failures" description="Quality is on track" className="py-8" />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  {['Job #', 'Defect / Description', 'Date', 'Status'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {failed.data.map((ins: any) => (
                  <tr key={ins.id} onClick={() => router.push(`/quality/${ins.id}`)} className="hover:bg-[var(--color-brand-light)] cursor-pointer transition-colors">
                    <td className="px-5 py-4 font-mono text-sm font-semibold text-[var(--color-text-primary)]">{ins.inspection_number || ins.id?.slice(0, 8)}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)] max-w-[180px] truncate">{ins.defect_type || ins.notes?.slice(0, 40) || '—'}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-tertiary)]">{ins.created_at ? fmt(ins.created_at) : '—'}</td>
                    <td className="px-5 py-4"><StatusPill status="blocked" label="Failed" /></td>
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
