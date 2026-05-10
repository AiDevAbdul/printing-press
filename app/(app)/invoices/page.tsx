'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Search, Receipt, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { invoicesService, type Invoice } from '@/lib/services/invoices.service';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);
}

function isOverdue(dueDate: string, status: string) {
  if (['paid', 'cancelled'].includes(status)) return false;
  return new Date(dueDate) < new Date();
}

export default function Invoices() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['invoices', page, search, status],
    queryFn: () => invoicesService.getAll({ page, limit: 15, search: search || undefined, status: status || undefined }),
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  const totalPages = data?.pages ?? 1;

  const totalOutstanding = data?.data
    .filter(i => !['paid', 'cancelled'].includes(i.status))
    .reduce((sum, i) => sum + Number(i.balance_amount), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Invoices</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {data ? `${data.total} invoices` : 'Track billing and payments'}
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => router.push('/invoices/new')}>
          New Invoice
        </Button>
      </div>

      {totalOutstanding > 0 && (
        <Card variant="outlined" padding="md" className="bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              <span className="font-semibold">{formatCurrency(totalOutstanding)}</span> outstanding across unpaid invoices on this page
            </p>
          </div>
        </Card>
      )}

      <Card variant="elevated" padding="md">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search by invoice number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            fullWidth
          />
          <div className="sm:w-44 shrink-0">
            <Select options={STATUS_OPTIONS} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} fullWidth />
          </div>
          <Button type="submit" variant="secondary" className="shrink-0">Search</Button>
        </form>
      </Card>

      <Card variant="elevated" padding="none">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)}
          </div>
        ) : error ? (
          <div className="p-6"><EmptyState icon={<AlertCircle />} title="Failed to load invoices" description="Check your connection and try again." /></div>
        ) : !data?.data.length ? (
          <div className="p-6"><EmptyState icon={<Receipt />} title="No invoices found" description={search || status ? 'Try adjusting your filters.' : 'Create your first invoice.'} /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-page-bg)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Invoice #</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Customer</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Invoice Date</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Due Date</th>
                    <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">Total</th>
                    <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">Paid</th>
                    <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">Balance</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {data.data.map((inv: Invoice) => (
                    <tr key={inv.id} onClick={() => router.push(`/invoices/${inv.id}`)} className="hover:bg-[var(--color-border-subtle)] cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-primary)]">{inv.invoice_number}</td>
                      <td className="px-4 py-3 text-[var(--color-text-primary)]">
                        <div>{inv.customers?.name || '—'}</div>
                        {inv.customers?.company_name && <div className="text-xs text-[var(--color-text-tertiary)]">{inv.customers.company_name}</div>}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{formatDate(inv.invoice_date)}</td>
                      <td className="px-4 py-3">
                        <span className={isOverdue(inv.due_date, inv.status) ? 'text-danger font-medium' : 'text-[var(--color-text-secondary)]'}>
                          {formatDate(inv.due_date)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--color-text-primary)] font-medium">{formatCurrency(Number(inv.total_amount))}</td>
                      <td className="px-4 py-3 text-right text-success">{formatCurrency(Number(inv.paid_amount))}</td>
                      <td className="px-4 py-3 text-right font-medium" style={{ color: Number(inv.balance_amount) > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {formatCurrency(Number(inv.balance_amount))}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="status" status={inv.status as any} dot>{inv.status}</Badge>
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
