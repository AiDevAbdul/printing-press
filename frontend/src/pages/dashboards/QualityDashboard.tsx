import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Clock, CheckCircle2, XCircle,
  ChevronRight, AlertTriangle, Calendar, User
} from 'lucide-react';
import api from '../../services/api';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

interface QAStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  approval_rate?: number;
}

interface Approval {
  id: string;
  status: string;
  notes?: string;
  created_at: string;
  stage?: { stage_name: string; stage_order: number };
  production_job?: {
    job_number: string;
    order?: { order_number: string; customer?: { name: string } };
  };
  approved_by_user?: { full_name: string };
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-surface rounded-lg border border-[var(--color-border-subtle)] p-5 space-y-3">
          <Skeleton variant="text" width="60%" />
          <Skeleton height={32} width="40%" />
        </div>
      ))}
    </div>
  );
}

export default function QualityDashboard() {
  const navigate = useNavigate();

  const { data: qaStats, isLoading: statsLoading } = useQuery<QAStats>({
    queryKey: ['qa-stats'],
    queryFn: async () => (await api.get('/approvals/stats')).data,
    staleTime: 30_000,
  });

  const { data: pendingRaw, isLoading: pendingLoading } = useQuery<Approval[] | { data: Approval[] }>({
    queryKey: ['qa-pending'],
    queryFn: async () => (await api.get('/approvals/pending')).data,
    staleTime: 15_000,
  });

  const pending: Approval[] = Array.isArray(pendingRaw)
    ? pendingRaw
    : (pendingRaw as any)?.data ?? [];

  const approvalRate = qaStats && qaStats.total > 0
    ? Math.round((qaStats.approved / qaStats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Quality Control</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Stage approvals and quality sign-offs
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => navigate('/qa-approval')}>
          Review Queue
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Pending Review"
            value={qaStats?.pending ?? 0}
            icon={<Clock className="w-5 h-5" />}
            color={qaStats?.pending ? 'warning' : 'success'}
          />
          <StatCard
            label="Approved"
            value={qaStats?.approved ?? 0}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="success"
          />
          <StatCard
            label="Rejected"
            value={qaStats?.rejected ?? 0}
            icon={<XCircle className="w-5 h-5" />}
            color={qaStats?.rejected ? 'danger' : 'success'}
          />
          <StatCard
            label="Approval Rate"
            value={`${approvalRate}%`}
            icon={<ShieldCheck className="w-5 h-5" />}
            color={approvalRate >= 90 ? 'success' : approvalRate >= 70 ? 'warning' : 'danger'}
          />
        </div>
      )}

      {/* Pending approvals */}
      <Card variant="default" padding="none">
        <div className="px-5 py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CardTitle>Pending Approvals</CardTitle>
            {!pendingLoading && pending.length > 0 && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}
              >
                {pending.length}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/qa-approval')}>
            View all
          </Button>
        </div>

        {pendingLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton variant="circular" width={36} height={36} />
                <div className="flex-1 space-y-1.5">
                  <Skeleton width="40%" height={14} />
                  <Skeleton width="25%" height={12} />
                </div>
                <Skeleton width="70px" height={14} />
              </div>
            ))}
          </div>
        ) : pending.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-success)' }} />
            <p className="text-sm font-medium text-[var(--color-text-primary)]">All clear</p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
              No approvals pending
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  {['Job / Order', 'Stage', 'Customer', 'Reviewer', 'Submitted'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {pending.slice(0, 15).map((approval) => (
                  <tr
                    key={approval.id}
                    className="hover:bg-[var(--color-page-bg)] transition-colors duration-fast cursor-pointer"
                    onClick={() => navigate(`/qa-approval`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--color-text-primary)]">
                        {approval.production_job?.job_number || '—'}
                      </div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">
                        {approval.production_job?.order?.order_number || ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                      {approval.stage?.stage_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                      {approval.production_job?.order?.customer?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {approval.approved_by_user && <User className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />}
                        {approval.approved_by_user?.full_name || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-tertiary)] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(approval.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short',
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Alert if high rejection */}
      {!statsLoading && qaStats && qaStats.rejected > 0 && approvalRate < 80 && (
        <div
          className="flex items-start gap-3 p-4 rounded-lg border"
          style={{
            backgroundColor: 'var(--color-warning-bg)',
            borderColor: 'var(--color-warning)',
          }}
        >
          <AlertTriangle
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: 'var(--color-warning)' }}
          />
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Approval rate below 80%
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              {qaStats.rejected} jobs rejected this period. Review rejection notes for common causes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
