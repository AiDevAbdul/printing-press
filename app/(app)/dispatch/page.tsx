'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Truck, AlertCircle, Package, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { dispatchService, type Delivery } from '@/lib/services/dispatch.service';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed', label: 'Failed' },
];

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Dispatch() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['dispatch', page, status],
    queryFn: () => dispatchService.getAll({ page, limit: 15, status: status || undefined }),
  });

  const totalPages = data?.pages ?? 1;

  const pendingCount = data?.data.filter(d => d.delivery_status === 'pending').length ?? 0;
  const inTransitCount = data?.data.filter(d => d.delivery_status === 'in_transit').length ?? 0;
  const deliveredCount = data?.data.filter(d => d.delivery_status === 'delivered').length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Dispatch</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {data ? `${data.total} deliveries` : 'Track outbound deliveries'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-white" /></div>
            <div><p className="text-2xl font-bold text-orange-900">{isLoading ? '—' : pendingCount}</p><p className="text-xs text-orange-700">Pending</p></div>
          </div>
        </Card>
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center"><Truck className="w-5 h-5 text-white" /></div>
            <div><p className="text-2xl font-bold text-blue-900">{isLoading ? '—' : inTransitCount}</p><p className="text-xs text-blue-700">In Transit</p></div>
          </div>
        </Card>
        <Card variant="elevated" padding="md" className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-white" /></div>
            <div><p className="text-2xl font-bold text-green-900">{isLoading ? '—' : deliveredCount}</p><p className="text-xs text-green-700">Delivered</p></div>
          </div>
        </Card>
      </div>

      <Card variant="elevated" padding="md">
        <div className="flex items-center gap-3">
          <div className="w-52">
            <Select options={STATUS_OPTIONS} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} fullWidth />
          </div>
          {status && <Button variant="ghost" size="sm" onClick={() => { setStatus(''); setPage(1); }}>Clear</Button>}
        </div>
      </Card>

      <Card variant="elevated" padding="none">
        {isLoading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)}</div>
        ) : error ? (
          <div className="p-6"><EmptyState icon={<AlertCircle />} title="Failed to load deliveries" description="Check your connection and try again." /></div>
        ) : !data?.data.length ? (
          <div className="p-6"><EmptyState icon={<Truck />} title="No deliveries found" description={status ? 'Try a different filter.' : 'Deliveries appear here when production jobs are completed.'} /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-page-bg)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Delivery #</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Address</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Scheduled</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Dispatched</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Courier</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Tracking</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {data.data.map((d: Delivery) => (
                    <tr key={d.id} onClick={() => router.push(`/dispatch/${d.id}`)} className="hover:bg-[var(--color-border-subtle)] cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-primary)]">{d.delivery_number}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)] capitalize">{d.delivery_type}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)] max-w-[160px] truncate">{d.delivery_address}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{formatDate(d.scheduled_date)}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{formatDateTime(d.dispatched_at)}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{d.courier_name || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">{d.tracking_number || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant="status" status={d.delivery_status as any} dot>{d.delivery_status.replace(/_/g, ' ')}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="px-4 py-4 border-t border-[var(--color-border-subtle)]">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={data.total} itemsPerPage={15} />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
