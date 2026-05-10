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
import { quotationsService, type Quotation } from '@/lib/services/quotations.service';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
];

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(amount?: number) {
  if (!amount) return '—';
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);
}

function isExpired(validUntil: string, status: string) {
  if (['approved', 'rejected'].includes(status)) return false;
  return new Date(validUntil) < new Date();
}

export default function Quotations() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['quotations', page, search, status],
    queryFn: () => quotationsService.getAll({ page, limit: 15, search: search || undefined, status: status || undefined }),
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
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Quotations</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {data ? `${data.total} quotations` : 'Manage price quotations'}
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => router.push('/quotations/new')}>
          New Quotation
        </Button>
      </div>

      <Card variant="elevated" padding="md">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search by quotation number or product..."
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

      <Card variant="elevated" padding="none">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)}
          </div>
        ) : error ? (
          <div className="p-6"><EmptyState icon={<AlertCircle />} title="Failed to load quotations" description="Check your connection and try again." /></div>
        ) : !data?.data.length ? (
          <div className="p-6"><EmptyState icon={<FileText />} title="No quotations found" description={search || status ? 'Try adjusting your filters.' : 'Create your first quotation.'} /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-page-bg)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Quotation #</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Customer</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Product</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Qty</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Valid Until</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Ver.</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {data.data.map((q: Quotation) => (
                    <tr key={q.id} onClick={() => router.push(`/quotations/${q.id}`)} className="hover:bg-[var(--color-border-subtle)] cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-primary)]">{q.quotation_number}</td>
                      <td className="px-4 py-3 text-[var(--color-text-primary)]">
                        <div>{q.customers?.name || '—'}</div>
                        {q.customers?.company_name && <div className="text-xs text-[var(--color-text-tertiary)]">{q.customers.company_name}</div>}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-primary)] max-w-[160px] truncate">{q.product_name}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{Number(q.quantity).toLocaleString()} {q.unit}</td>
                      <td className="px-4 py-3 text-[var(--color-text-primary)]">{formatCurrency(q.final_price || q.total_amount)}</td>
                      <td className="px-4 py-3">
                        <span className={isExpired(q.valid_until, q.status) ? 'text-danger font-medium' : 'text-[var(--color-text-secondary)]'}>
                          {formatDate(q.valid_until)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-tertiary)] text-xs">v{q.version}</td>
                      <td className="px-4 py-3">
                        <Badge variant="status" status={q.status as any} dot>{q.status}</Badge>
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
