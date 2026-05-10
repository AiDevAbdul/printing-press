'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Search, FileText, AlertCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { StatusPill, type StatusPillStatus } from '@/components/ui/StatusPill';
import { ordersService, type Order } from '@/lib/services/orders.service';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_production', label: 'In Production' },
  { value: 'completed', label: 'Completed' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PRIORITY_DOT: Record<string, string> = {
  urgent: 'var(--color-danger)',
  high:   'var(--color-warning)',
  normal: 'var(--color-info)',
  low:    'var(--color-text-tertiary)',
};

function orderStatusToPill(s: string): { status: StatusPillStatus; label: string } {
  switch (s) {
    case 'pending':       return { status: 'pending',     label: 'Pending' };
    case 'approved':      return { status: 'approved',    label: 'Approved' };
    case 'in_production': return { status: 'in_progress', label: 'In Production' };
    case 'completed':     return { status: 'completed',   label: 'Completed' };
    case 'delivered':     return { status: 'completed',   label: 'Delivered' };
    case 'cancelled':     return { status: 'cancelled',   label: 'Cancelled' };
    default:              return { status: 'queued',      label: s.replace(/_/g, ' ') };
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(amount?: number) {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);
}

function isOverdue(deliveryDate: string, status: string) {
  if (['delivered', 'completed', 'cancelled'].includes(status)) return false;
  return new Date(deliveryDate) < new Date();
}

export default function Orders() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', page, search, status],
    queryFn: () => ordersService.getAll({ page, limit: 15, search: search || undefined, status: status || undefined }),
  });

  const overdueCount = useMemo(
    () => (data?.data ?? []).filter(o => isOverdue(o.delivery_date, o.status)).length,
    [data],
  );
  const urgentCount = useMemo(
    () => (data?.data ?? []).filter(o => o.priority === 'urgent').length,
    [data],
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  const totalPages = data?.pages ?? 1;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">Orders</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1 flex flex-wrap items-center gap-x-2">
            {data ? (
              <>
                <span>{data.total.toLocaleString()} total</span>
                {overdueCount > 0 && (
                  <span className="flex items-center gap-1 text-[var(--color-danger)] font-medium">
                    <Clock className="w-3 h-3" />
                    {overdueCount} overdue
                  </span>
                )}
                {urgentCount > 0 && (
                  <span className="text-[var(--color-warning)] font-medium">
                    · {urgentCount} urgent
                  </span>
                )}
              </>
            ) : (
              'Manage print orders'
            )}
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => router.push('/orders/new')}>
          New Order
        </Button>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
        <Input
          placeholder="Search by order number or product..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          fullWidth
        />
        <div className="sm:w-44 shrink-0">
          <Select
            options={STATUS_OPTIONS}
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            fullWidth
          />
        </div>
        <Button type="submit" variant="secondary" className="shrink-0">Search</Button>
      </form>

      {/* Table */}
      <Card variant="elevated" padding="none">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="text" className="h-14" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8">
            <EmptyState icon={<AlertCircle />} title="Failed to load orders" description="Check your connection and try again." />
          </div>
        ) : !data?.data.length ? (
          <div className="p-8">
            <EmptyState
              icon={<FileText />}
              title="No orders found"
              description={search || status ? 'Try adjusting your filters.' : 'Create your first order to get started.'}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)]">
                    {['Order', 'Customer', 'Product', 'Qty', 'Delivery', 'Amount', 'Priority', 'Status'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((order: Order) => {
                    const overdue = isOverdue(order.delivery_date, order.status);
                    const pill = orderStatusToPill(order.status);
                    return (
                      <tr
                        key={order.id}
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="group border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-brand-light)] cursor-pointer transition-colors duration-150"
                      >
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs text-[var(--color-brand)] font-semibold group-hover:underline underline-offset-2">
                            {order.order_number}
                          </span>
                          {order.is_repeat_order && (
                            <span className="ml-2 text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[var(--color-border-subtle)] text-[var(--color-text-tertiary)]">
                              Repeat
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {order.customers ? (
                            <>
                              <div className="text-[var(--color-text-primary)] font-medium leading-tight">{order.customers.name}</div>
                              {order.customers.company_name && (
                                <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{order.customers.company_name}</div>
                              )}
                            </>
                          ) : (
                            <span className="text-[var(--color-text-tertiary)] text-xs">Walk-in</span>
                          )}
                        </td>

                        <td className="px-5 py-4 max-w-[200px]">
                          <div className="text-[var(--color-text-primary)] truncate leading-tight">{order.product_name}</div>
                          {order.product_type && (
                            <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5 capitalize">
                              {order.product_type.replace(/_/g, ' ')}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-[var(--color-text-primary)]">{order.quantity.toLocaleString()}</span>
                          <span className="text-[var(--color-text-tertiary)] text-xs ml-1">{order.unit}</span>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {overdue ? (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[var(--color-danger)] flex-shrink-0" />
                              <span className="text-[var(--color-danger)] font-medium text-xs">{formatDate(order.delivery_date)}</span>
                            </div>
                          ) : (
                            <span className="text-[var(--color-text-secondary)]">{formatDate(order.delivery_date)}</span>
                          )}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-[var(--color-text-primary)]">
                          {formatCurrency(order.quoted_price)}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: PRIORITY_DOT[order.priority] ?? PRIORITY_DOT.normal }}
                            />
                            <span className="text-xs capitalize text-[var(--color-text-secondary)]">{order.priority}</span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <StatusPill status={pill.status} label={pill.label} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-[var(--color-border-subtle)]">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={data.total}
                  itemsPerPage={15}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
