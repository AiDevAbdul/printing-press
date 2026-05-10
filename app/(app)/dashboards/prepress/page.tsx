'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Layers, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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

export default function PrePressDashboard() {
  const router = useRouter();
  const { data: allDesigns, isLoading: allLoading } = useQuery({ queryKey: ['pp-all'], queryFn: () => fetchDesigns() });
  const { data: inDesign, isLoading: inDesignLoading } = useQuery({ queryKey: ['pp-in-design'], queryFn: () => fetchDesigns('in_design') });
  const { data: approvals, isLoading: approvalsLoading } = useQuery({ queryKey: ['pp-approvals'], queryFn: fetchPendingApprovals });

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Pre-Press Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Design queue, approvals, and workflow status</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Designs', value: allLoading ? null : allDesigns?.total, icon: <Layers className="w-5 h-5 text-white" />, color: 'from-blue-500 to-blue-600' },
          { label: 'In Design', value: inDesignLoading ? null : inDesign?.total, icon: <Clock className="w-5 h-5 text-white" />, color: 'from-orange-500 to-orange-600' },
          { label: 'Pending Approval', value: approvalsLoading ? null : approvals?.total, icon: <AlertCircle className="w-5 h-5 text-white" />, color: 'from-yellow-500 to-yellow-600' },
          { label: 'Approved', value: null, icon: <CheckCircle2 className="w-5 h-5 text-white" />, color: 'from-green-500 to-green-600' },
        ].map((card, i) => (
          <Card key={i} variant="elevated" padding="md">
            <div className="flex items-start justify-between gap-2">
              <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shrink-0`}>{card.icon}</div>
              <div className="text-right">
                <p className="text-xs text-[var(--color-text-secondary)]">{card.label}</p>
                {(allLoading || inDesignLoading || approvalsLoading) ? <Skeleton variant="text" className="h-8 w-10 mt-1" /> : (
                  <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">{card.value ?? '—'}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" padding="none">
          <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-text-primary)]">Pending Approvals</h2>
            <button onClick={() => router.push('/qa-approval')} className="text-xs text-brand hover:underline">Review all →</button>
          </div>
          {approvalsLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="text" className="h-10" />)}</div>
          ) : !(approvals?.data?.length) ? (
            <div className="p-5 text-center text-sm text-success">No pending approvals</div>
          ) : (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {approvals.data.map((a: any) => (
                <div key={a.id} onClick={() => router.push('/qa-approval')} className="px-4 py-3 flex items-center justify-between hover:bg-[var(--color-border-subtle)] cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{a.designs?.name || '—'}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{a.designs?.design_type} · {formatDate(a.created_at)}</p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card variant="elevated" padding="none">
          <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-text-primary)]">Active Designs</h2>
            <button onClick={() => router.push('/prepress')} className="text-xs text-brand hover:underline">View all →</button>
          </div>
          {inDesignLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="text" className="h-10" />)}</div>
          ) : !(inDesign?.data?.length) ? (
            <div className="p-5 text-center text-sm text-[var(--color-text-secondary)]">No active designs</div>
          ) : (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {inDesign.data.map((d: any) => (
                <div key={d.id} onClick={() => router.push(`/prepress/${d.id}`)} className="px-4 py-3 flex items-center justify-between hover:bg-[var(--color-border-subtle)] cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{d.name}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{d.product_name || d.design_type} · {formatDate(d.created_at)}</p>
                  </div>
                  <Badge variant="info">In Design</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
