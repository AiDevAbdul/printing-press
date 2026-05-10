'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Layers, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { StatusPill, StatusPillStatus } from '@/components/ui/StatusPill';
import { Skeleton } from '@/components/ui/Skeleton';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function fetchDesigns(status?: string) {
  const q = new URLSearchParams({ limit: '10' });
  if (status) q.set('status', status);
  const res = await fetch(`${API_BASE}/prepress?${q}`, { credentials: 'include' });
  if (!res.ok) return { data: [], total: 0 };
  return res.json();
}

async function fetchPendingApprovals() {
  const res = await fetch(`${API_BASE}/approvals?status=pending&limit=8`, { credentials: 'include' });
  if (!res.ok) return { data: [], total: 0 };
  return res.json();
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });
}

function ppStatusPill(status?: string) {
  const map: Record<string, [StatusPillStatus, string]> = {
    in_design:         ['in_progress', 'In Design'],
    pending_approval:  ['pending',     'Pending'],
    approved:          ['approved',    'Approved'],
    rejected:          ['blocked',     'Rejected'],
    revision_required: ['paused',      'Revision Needed'],
  };
  const [s, l] = map[status ?? ''] ?? ['queued' as StatusPillStatus, status ?? '—'];
  return <StatusPill status={s} label={l} />;
}

export default function PrePressDashboard() {
  const router = useRouter();
  const { data: allDesigns, isLoading: allLoading } = useQuery({ queryKey: ['pp-all'], queryFn: () => fetchDesigns() });
  const { data: inDesign, isLoading: inDesignLoading } = useQuery({ queryKey: ['pp-in-design'], queryFn: () => fetchDesigns('in_design') });
  const { data: approvals, isLoading: approvalsLoading } = useQuery({ queryKey: ['pp-approvals'], queryFn: fetchPendingApprovals });

  const loading = allLoading || inDesignLoading || approvalsLoading;
  const approvedCount = (allDesigns?.total ?? 0) - (inDesign?.total ?? 0) - (approvals?.total ?? 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">Pre-Press Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Design queue, approvals, and workflow status</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" className="h-28" />) : (<>
          <StatCard label="Total Designs" value={allDesigns?.total ?? 0} icon={<Layers />} accent="brand" href="/prepress" />
          <StatCard label="In Design" value={inDesign?.total ?? 0} icon={<Clock />} accent="info" />
          <StatCard label="Pending Approval" value={approvals?.total ?? 0} icon={<AlertCircle />} accent="warning" />
          <StatCard label="Approved" value={Math.max(0, approvedCount)} icon={<CheckCircle2 />} accent="success" />
        </>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card variant="elevated" padding="none">
          <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--color-border-subtle)]">
            <CardTitle>In Design</CardTitle>
            <button onClick={() => router.push('/prepress')} className="text-xs text-[var(--color-brand)] hover:underline">View all →</button>
          </div>
          {inDesignLoading ? (
            <div className="p-5 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)}</div>
          ) : !(inDesign?.data?.length) ? (
            <div className="px-5 py-8 text-center text-sm text-[var(--color-text-secondary)]">No active designs</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  {['Design Name', 'Type', 'Designer', 'Updated'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {inDesign.data.map((d: any) => (
                  <tr key={d.id} onClick={() => router.push(`/prepress/${d.id}`)} className="hover:bg-[var(--color-brand-light)] cursor-pointer transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-[var(--color-text-primary)]">{d.name || '—'}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">{d.design_type || '—'}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">{d.designer_name || '—'}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-tertiary)]">{d.updated_at ? fmt(d.updated_at) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card variant="elevated" padding="none">
          <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--color-border-subtle)]">
            <CardTitle>Pending Approvals</CardTitle>
            <button onClick={() => router.push('/prepress')} className="text-xs text-[var(--color-brand)] hover:underline">Review all →</button>
          </div>
          {approvalsLoading ? (
            <div className="p-5 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="text" className="h-10" />)}</div>
          ) : !(approvals?.data?.length) ? (
            <div className="px-5 py-8 text-center text-sm text-[var(--color-text-secondary)]">No pending approvals</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  {['Design', 'Requested', 'Status'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {approvals.data.map((a: any) => (
                  <tr key={a.id} onClick={() => router.push(`/prepress/${a.design_id || a.id}`)} className="hover:bg-[var(--color-brand-light)] cursor-pointer transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-[var(--color-text-primary)]">{a.designs?.name || a.design_name || '—'}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-tertiary)]">{a.created_at ? fmt(a.created_at) : '—'}</td>
                    <td className="px-5 py-4">{ppStatusPill(a.status)}</td>
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
