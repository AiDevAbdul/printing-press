'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

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

function formatDate(d: string) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Quality Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Inspections, defects, and pass rates</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Inspections', value: allLoading ? null : all?.total, icon: <ShieldCheck className="w-5 h-5 text-white" />, color: 'from-blue-500 to-blue-600' },
          { label: 'Pending', value: pendingLoading ? null : pending?.total, icon: <Clock className="w-5 h-5 text-white" />, color: 'from-yellow-500 to-yellow-600' },
          { label: 'Passed', value: passedLoading ? null : passed?.total, icon: <CheckCircle2 className="w-5 h-5 text-white" />, color: 'from-green-500 to-green-600' },
          { label: 'Failed', value: failedLoading ? null : failed?.total, icon: <XCircle className="w-5 h-5 text-white" />, color: 'from-red-500 to-red-600' },
        ].map((card, i) => (
          <Card key={i} variant="elevated" padding="md">
            <div className="flex items-start justify-between gap-2">
              <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shrink-0`}>{card.icon}</div>
              <div className="text-right">
                <p className="text-xs text-[var(--color-text-secondary)]">{card.label}</p>
                {(allLoading || pendingLoading || passedLoading || failedLoading) ? <Skeleton variant="text" className="h-8 w-10 mt-1" /> : (
                  <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">{card.value ?? 0}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {passRate !== null && (
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[var(--color-text-primary)]">Overall Pass Rate</h2>
            <span className="text-2xl font-bold" style={{ color: passRate >= 90 ? 'var(--color-success)' : passRate >= 70 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
              {passRate}%
            </span>
          </div>
          <div className="h-3 bg-[var(--color-border-subtle)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${passRate}%`,
                backgroundColor: passRate >= 90 ? 'var(--color-success)' : passRate >= 70 ? 'var(--color-warning)' : 'var(--color-danger)',
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-[var(--color-text-tertiary)]">
            <span>0%</span>
            <span className="text-orange-500">70% acceptable</span>
            <span className="text-green-500">90% target</span>
            <span>100%</span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" padding="none">
          <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />Pending Inspections
            </h2>
            <button onClick={() => router.push('/quality')} className="text-xs text-brand hover:underline">View all →</button>
          </div>
          {pendingLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="text" className="h-10" />)}</div>
          ) : !(pending?.data?.length) ? (
            <div className="p-5 text-center text-sm text-success">No pending inspections</div>
          ) : (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {pending.data.map((ins: any) => (
                <div key={ins.id} onClick={() => router.push(`/quality/${ins.id}`)} className="px-4 py-3 flex items-center justify-between hover:bg-[var(--color-border-subtle)] cursor-pointer">
                  <div>
                    <p className="font-mono text-xs font-medium text-[var(--color-text-primary)]">{ins.inspection_number || ins.id.slice(0, 8)}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{formatDate(ins.created_at)}</p>
                  </div>
                  <Badge variant="warning" dot>Pending</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card variant="elevated" padding="none">
          <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <XCircle className="w-4 h-4 text-danger" />Recent Failures
            </h2>
            <button onClick={() => router.push('/quality')} className="text-xs text-brand hover:underline">View all →</button>
          </div>
          {failedLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="text" className="h-10" />)}</div>
          ) : !(failed?.data?.length) ? (
            <div className="p-5 text-center text-sm text-success">No recent failures</div>
          ) : (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {failed.data.map((ins: any) => (
                <div key={ins.id} onClick={() => router.push(`/quality/${ins.id}`)} className="px-4 py-3 flex items-center justify-between hover:bg-[var(--color-border-subtle)] cursor-pointer">
                  <div>
                    <p className="font-mono text-xs font-medium text-[var(--color-text-primary)]">{ins.inspection_number || ins.id.slice(0, 8)}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{ins.notes ? ins.notes.slice(0, 40) + '…' : formatDate(ins.created_at)}</p>
                  </div>
                  <Badge variant="danger" dot>Failed</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
