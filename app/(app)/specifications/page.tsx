'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FileSearch, Search, AlertCircle, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'in_design', label: 'In Design' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

async function fetchSpecs(page: number, search: string, status: string) {
  const q = new URLSearchParams({ page: String(page), limit: '15' });
  if (search) q.set('search', search);
  if (status) q.set('status', status);
  const res = await fetch(`${API_BASE}/prepress?${q}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Specifications() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['specs', page, search, status],
    queryFn: () => fetchSpecs(page, search, status),
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  const totalPages = data?.pages ?? 1;
  const withSpecsCount = data?.data.filter((d: any) => d.specs_sheet_url).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Specifications</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {data ? `${data.total} designs · ${withSpecsCount} with spec sheets` : 'Product design specifications'}
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => router.push('/prepress/new')}>
          New Design
        </Button>
      </div>

      <Card variant="elevated" padding="md">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search by design name or product..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            fullWidth
          />
          <div className="sm:w-52 shrink-0">
            <Select options={STATUS_OPTIONS} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} fullWidth />
          </div>
          <Button type="submit" variant="secondary" className="shrink-0">Search</Button>
        </form>
      </Card>

      <Card variant="elevated" padding="none">
        {isLoading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)}</div>
        ) : error ? (
          <div className="p-6"><EmptyState icon={<AlertCircle />} title="Failed to load specifications" description="Check your connection and try again." /></div>
        ) : !data?.data.length ? (
          <div className="p-6"><EmptyState icon={<FileSearch />} title="No specifications found" description={search || status ? 'Try adjusting your filters.' : 'Design specifications appear here once created.'} /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-page-bg)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Design Name</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Product</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Spec Sheet</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Approval Sheet</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Updated</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {data.data.map((d: any) => (
                    <tr key={d.id} onClick={() => router.push(`/prepress/${d.id}`)} className="hover:bg-[var(--color-border-subtle)] cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{d.name}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{d.product_name || '—'}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)] capitalize">{d.design_type}</td>
                      <td className="px-4 py-3">
                        {d.specs_sheet_url ? (
                          <a href={d.specs_sheet_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                            className="text-brand text-xs hover:underline">View</a>
                        ) : <span className="text-[var(--color-text-tertiary)] text-xs">None</span>}
                      </td>
                      <td className="px-4 py-3">
                        {d.approval_sheet_url ? (
                          <a href={d.approval_sheet_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                            className="text-brand text-xs hover:underline">View</a>
                        ) : <span className="text-[var(--color-text-tertiary)] text-xs">None</span>}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{formatDate(d.updated_at)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="status" status={d.status as any} dot>{d.status.replace(/_/g, ' ')}</Badge>
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
