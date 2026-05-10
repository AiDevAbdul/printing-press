'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Search, Layers, AlertCircle, Tag, Box, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { StatusPill, type StatusPillStatus } from '@/components/ui/StatusPill';
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
  label: 'Label', carton: 'Carton', leaflet: 'Leaflet',
  blister: 'Blister', other: 'Other', box: 'Box', logo: 'Logo', literature: 'Literature',
};

const TYPE_PALETTE: Record<string, { bg: string; icon: string }> = {
  label:      { bg: '#EFF6FF', icon: '#3B82F6' },
  carton:     { bg: '#F0FDF4', icon: '#22C55E' },
  leaflet:    { bg: '#FAF5FF', icon: '#A855F7' },
  blister:    { bg: '#FFF7ED', icon: '#F97316' },
  box:        { bg: '#F0FDF4', icon: '#16A34A' },
  logo:       { bg: '#FFF1F2', icon: '#F43F5E' },
  literature: { bg: '#FAF5FF', icon: '#A855F7' },
  other:      { bg: '#F5F5F7', icon: '#8E8E93' },
};

function TypeIcon({ type, ...props }: { type: string } & React.SVGProps<SVGSVGElement>) {
  switch (type) {
    case 'carton':
    case 'box':     return <Box {...props as any} />;
    case 'leaflet':
    case 'literature': return <FileText {...props as any} />;
    default:        return <Tag {...props as any} />;
  }
}

function statusToPill(s: string): { status: StatusPillStatus; label: string } {
  switch (s) {
    case 'in_design':         return { status: 'in_progress', label: 'In Design' };
    case 'pending_approval':  return { status: 'pending',     label: 'Pending Approval' };
    case 'approved':          return { status: 'approved',    label: 'Approved' };
    case 'rejected':          return { status: 'blocked',     label: 'Rejected' };
    case 'revision_required': return { status: 'paused',      label: 'Revision Required' };
    default:                  return { status: 'queued',      label: s.replace(/_/g, ' ') };
  }
}

function relativeAge(date: string): string {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1mo ago' : `${months}mo ago`;
}

function DesignCard({ design, onClick }: { design: Design; onClick: () => void }) {
  const palette = TYPE_PALETTE[design.design_type] ?? TYPE_PALETTE.other;
  const pill = statusToPill(design.status);

  return (
    <button
      onClick={onClick}
      className="text-left w-full rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
    >
      {/* Thumbnail */}
      <div
        className="relative h-28 flex items-center justify-center"
        style={{ backgroundColor: palette.bg }}
      >
        <TypeIcon
          type={design.design_type}
          className="w-10 h-10 opacity-[0.18]"
          style={{ color: palette.icon }}
          aria-hidden="true"
        />
        <div className="absolute top-2 right-2">
          <StatusPill status={pill.status} label={pill.label} />
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="font-semibold text-sm text-[var(--color-text-primary)] leading-snug line-clamp-2">
          {design.name}
        </p>
        {design.product_name && (
          <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">
            {design.product_name}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-[var(--color-text-tertiary)]">
            {DESIGN_TYPE_LABELS[design.design_type] ?? design.design_type}
          </span>
          <span className="text-xs text-[var(--color-text-tertiary)]">
            {relativeAge(design.created_at)}
          </span>
        </div>
        {(design.specs_sheet_url || design.approval_sheet_url) && (
          <div className="flex gap-1 mt-2">
            {design.specs_sheet_url && (
              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">Spec</span>
            )}
            {design.approval_sheet_url && (
              <span className="px-1.5 py-0.5 bg-green-50 text-green-600 text-xs rounded">Approval</span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

export default function Prepress() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['prepress', page, search, status],
    queryFn: () =>
      prepressService.getAll({ page, limit: 20, search: search || undefined, status: status || undefined }),
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  const totalPages = data?.pages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Card grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-52" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={<AlertCircle />}
          title="Failed to load designs"
          description="Check your connection and try again."
        />
      ) : !data?.data.length ? (
        <EmptyState
          icon={<Layers />}
          title="No designs found"
          description={
            search || status
              ? 'Try adjusting your filters.'
              : 'Upload your first design to start the approval workflow.'
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.data.map((design: Design) => (
              <DesignCard
                key={design.id}
                design={design}
                onClick={() => router.push(`/prepress/${design.id}`)}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={data.total}
              itemsPerPage={20}
            />
          )}
        </>
      )}
    </div>
  );
}
