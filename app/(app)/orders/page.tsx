'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Search, FileText, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { ordersService, type Order } from '@/lib/services/orders.service';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_production', label: 'In Production' },
  { value: 'completed', label: 'Completed' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  const totalPages = data?.pages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Orders</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {data ? `${data.total} total orders` : 'Manage print orders'}
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => router.push('/orders/new')}>
          New Order
        </Button>
      </div>

      {/* Filters */}
      <Card variant="elevated" padding="md">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search by order number or product..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            fullWidth
          />
          <div className="sm:w-44 shrink-0">
            <Select
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              fullWidth
            />
          </div>
          <Button type="submit" variant="secondary" className="shrink-0">Search</Button>
        </form>
      </Card>

      {/* Table */}
      <Card variant="elevated" padding="none">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="text" className="h-12" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6">
            <EmptyState icon={<AlertCircle />} title="Failed to load orders" description="Check your connection and try again." />
          </div>
        ) : !data?.data.length ? (
          <div className="p-6">
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
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-page-bg)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Order #</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Customer</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Product</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Qty</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Delivery</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Priority</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {data.data.map((order: Order) => (
                    <tr
                      key={order.id}
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="hover:bg-[var(--color-border-subtle)] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-primary)]">
                        {order.order_number}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-primary)]">
                        <div>{order.customers?.name || '—'}</div>
                        {order.customers?.company_name && (
                          <div className="text-xs text-[var(--color-text-tertiary)]">{order.customers.company_name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-primary)] max-w-[180px] truncate">
                        {order.product_name}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {order.quantity.toLocaleString()} {order.unit}
                      </td>
                      <td className="px-4 py-3">
                        <span className={isOverdue(order.delivery_date, order.status) ? 'text-danger font-medium' : 'text-[var(--color-text-secondary)]'}>
                          {formatDate(order.delivery_date)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-primary)]">
                        {formatCurrency(order.quoted_price)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="priority" priority={order.priority as any} dot>
                          {order.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="status" status={order.status as any} dot>
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-4 border-t border-[var(--color-border-subtle)]">
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
