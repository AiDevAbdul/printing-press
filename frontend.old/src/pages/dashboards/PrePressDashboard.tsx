import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Pencil, Clock, CheckCircle2, XCircle,
  ChevronRight, FileImage, Calendar
} from 'lucide-react';
import api from '../../services/api';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Card, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

interface Design {
  id: string;
  name: string;
  status: 'in_design' | 'waiting_for_data' | 'approved' | 'rejected';
  design_type: string;
  product_category: string;
  version: number;
  created_at: string;
  updated_at: string;
  designer?: { full_name: string };
  order?: { order_number: string; customer?: { name: string } };
}

const statusConfig: Record<Design['status'], { label: string; badgeVariant: 'status'; badgeStatus: 'in_progress' | 'pending' | 'approved' | 'rejected' }> = {
  in_design:        { label: 'In Design',        badgeVariant: 'status', badgeStatus: 'in_progress' },
  waiting_for_data: { label: 'Waiting for Data', badgeVariant: 'status', badgeStatus: 'pending' },
  approved:         { label: 'Approved',          badgeVariant: 'status', badgeStatus: 'approved' },
  rejected:         { label: 'Rejected',          badgeVariant: 'status', badgeStatus: 'rejected' },
};

function countByStatus(designs: Design[], status: Design['status']) {
  return designs.filter((d) => d.status === status).length;
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

export default function PrePressDashboard() {
  const navigate = useNavigate();

  const { data: designs = [], isLoading } = useQuery<Design[]>({
    queryKey: ['prepress-designs'],
    queryFn: async () => {
      const res = await api.get('/prepress/designs');
      return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
    },
    staleTime: 30_000,
  });

  const inDesign       = countByStatus(designs, 'in_design');
  const waitingForData = countByStatus(designs, 'waiting_for_data');
  const approved       = countByStatus(designs, 'approved');
  const rejected       = countByStatus(designs, 'rejected');

  // Show active (non-approved, non-rejected) first, then the rest
  const prioritised = [
    ...designs.filter((d) => d.status === 'in_design' || d.status === 'waiting_for_data'),
    ...designs.filter((d) => d.status === 'approved' || d.status === 'rejected'),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Pre-Press</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Design review and approval workflow
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => navigate('/prepress')}>
          Manage Designs
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="In Design"
            value={inDesign}
            icon={<Pencil className="w-5 h-5" />}
            color="brand"
          />
          <StatCard
            label="Waiting for Data"
            value={waitingForData}
            icon={<Clock className="w-5 h-5" />}
            color="warning"
          />
          <StatCard
            label="Approved"
            value={approved}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="success"
          />
          <StatCard
            label="Rejected"
            value={rejected}
            icon={<XCircle className="w-5 h-5" />}
            color={rejected > 0 ? 'danger' : 'success'}
          />
        </div>
      )}

      {/* Designs table */}
      <Card variant="default" padding="none">
        <div className="px-5 py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
          <CardTitle>Recent Designs</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/prepress')}>
            View all
          </Button>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton variant="circular" width={36} height={36} />
                <div className="flex-1 space-y-1.5">
                  <Skeleton width="40%" height={14} />
                  <Skeleton width="25%" height={12} />
                </div>
                <Skeleton width="80px" height={22} className="rounded-full" />
                <Skeleton width="70px" height={14} />
              </div>
            ))}
          </div>
        ) : designs.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <FileImage className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-tertiary)]" />
            <p className="text-sm font-medium text-[var(--color-text-primary)]">No designs yet</p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
              Create your first design in Pre-Press
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  {['Design', 'Type / Category', 'Designer', 'Status', 'Updated'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {prioritised.slice(0, 15).map((design) => {
                  const cfg = statusConfig[design.status];
                  return (
                    <tr
                      key={design.id}
                      className="hover:bg-[var(--color-page-bg)] transition-colors duration-fast cursor-pointer"
                      onClick={() => navigate(`/prepress?design=${design.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-[var(--color-text-primary)]">
                          {design.name}
                        </div>
                        {design.order && (
                          <div className="text-xs text-[var(--color-text-tertiary)]">
                            {design.order.order_number}
                            {design.order.customer && ` · ${design.order.customer.name}`}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)] capitalize whitespace-nowrap">
                        <div>{design.design_type?.replace('_', ' ')}</div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">
                          {design.product_category?.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                        {design.designer?.full_name || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="status" status={cfg.badgeStatus} dot>
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-tertiary)] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(design.updated_at).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short',
                          })}
                        </div>
                      </td>
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
