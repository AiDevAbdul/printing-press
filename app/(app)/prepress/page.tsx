'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Search, Layers, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { prepressService, type Design } from '@/lib/services/prepress.service';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'in_design', label: 'In Design' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'revision_required', label: 'Revision Required' },
];

const DESIGN_TYPE_LABELS: Record<string, string> = {
  label: 'Label',
  carton: 'Carton',
  leaflet: 'Leaflet',
  blister: 'Blister',
  other: 'Other',
};

const CATEGORY_LABELS: Record<string, string> = {
  pharmaceutical: 'Pharma',
  food: 'Food',
  cosmetic: 'Cosmetic',
  industrial: 'Industrial',
  other: 'Other',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Prepress() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['prepress', page, search, status],
    queryFn: () => prepressService.getAll({ page, limit: 15, search: search || undefined, status: status || undefined }),
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
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Pre-Press</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {data ? `${data.total} designs` : 'Design files and approval workflow'}
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => router.push('/prepress/new')}>
          New Design
        </Button>
      </div>

      {/* Filters */}
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
            <EmptyState icon={<AlertCircle />} title="Failed to load designs" description="Check your connection and try again." />
          </div>
        ) : !data?.data.length ? (
          <div className="p-6">
            <EmptyState
              icon={<Layers />}
              title="No designs found"
              description={search || status ? 'Try adjusting your filters.' : 'Upload your first design to start the approval workflow.'}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-page-bg)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Design Name</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Product</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Files</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Created</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {data.data.map((design: Design) => (
                    <tr
                      key={design.id}
                      onClick={() => router.push(`/prepress/${design.id}`)}
                      className="hover:bg-[var(--color-border-subtle)] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                        {design.name}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {design.product_name || '—'}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {DESIGN_TYPE_LABELS[design.design_type] || design.design_type}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {CATEGORY_LABELS[design.product_category] || design.product_category}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {design.specs_sheet_url && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">Spec</span>
                          )}
                          {design.approval_sheet_url && (
                            <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded">Approval</span>
                          )}
                          {!design.specs_sheet_url && !design.approval_sheet_url && (
                            <span className="text-[var(--color-text-tertiary)] text-xs">No files</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {formatDate(design.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="status" status={design.status as any} dot>
                          {design.status.replace(/_/g, ' ')}
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
