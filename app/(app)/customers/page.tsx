'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Search, Users, AlertCircle, Mail, Phone } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { customersService, type Customer } from '@/lib/services/customers.service';

const STATUS_OPTIONS = [
  { value: '', label: 'All Customers' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Customers() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', page, search, activeFilter],
    queryFn: () => customersService.getAll({
      page,
      limit: 15,
      search: search || undefined,
      is_active: activeFilter === '' ? undefined : activeFilter === 'true',
    }),
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
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Customers</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {data ? `${data.total} customers` : 'Manage your customer accounts'}
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => router.push('/customers/new')}>
          Add Customer
        </Button>
      </div>

      {/* Filters */}
      <Card variant="elevated" padding="md">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search by name, company, email or phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            fullWidth
          />
          <div className="sm:w-40 shrink-0">
            <Select
              options={STATUS_OPTIONS}
              value={activeFilter}
              onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
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
              <Skeleton key={i} variant="text" className="h-14" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6">
            <EmptyState icon={<AlertCircle />} title="Failed to load customers" description="Check your connection and try again." />
          </div>
        ) : !data?.data.length ? (
          <div className="p-6">
            <EmptyState
              icon={<Users />}
              title="No customers found"
              description={search || activeFilter ? 'Try adjusting your filters.' : 'Add your first customer to get started.'}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-page-bg)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Customer</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Contact</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">City</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Group</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Credit Limit</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Credit Days</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {data.data.map((customer: Customer) => (
                    <tr
                      key={customer.id}
                      onClick={() => router.push(`/customers/${customer.id}`)}
                      className="hover:bg-[var(--color-border-subtle)] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {getInitials(customer.name)}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--color-text-primary)]">{customer.name}</p>
                            {customer.company_name && (
                              <p className="text-xs text-[var(--color-text-tertiary)]">{customer.company_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs truncate max-w-[160px]">{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs">{customer.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {customer.city || '—'}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {customer.customer_group || '—'}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-primary)]">
                        {formatCurrency(customer.credit_limit)}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {customer.credit_days}d
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={customer.is_active ? 'success' : 'default'} dot>
                          {customer.is_active ? 'Active' : 'Inactive'}
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
