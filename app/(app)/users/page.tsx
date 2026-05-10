'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, AlertCircle, Plus, Mail, Phone } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { usersService, type User } from '@/lib/services/users.service';

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => usersService.getAll({ page, limit: 15, search: search || undefined }),
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
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Users</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {data ? `${data.total} users in this company` : 'Manage system users'}
          </p>
        </div>
      </div>

      <Card variant="elevated" padding="md">
        <form onSubmit={handleSearch} className="flex gap-3">
          <Input
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            fullWidth
          />
          <Button type="submit" variant="secondary" className="shrink-0">Search</Button>
        </form>
      </Card>

      <Card variant="elevated" padding="none">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} variant="text" className="h-14" />)}
          </div>
        ) : error ? (
          <div className="p-6"><EmptyState icon={<AlertCircle />} title="Failed to load users" description="Check your connection and try again." /></div>
        ) : !data?.data.length ? (
          <div className="p-6"><EmptyState icon={<Users />} title="No users found" description={search ? 'Try a different search.' : 'No users in this company.'} /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-page-bg)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">User</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Contact</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Department</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Role</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Joined</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {data.data.map((user: User) => (
                    <tr key={user.id} className="hover:bg-[var(--color-border-subtle)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {getInitials(user.full_name)}
                          </div>
                          <p className="font-medium text-[var(--color-text-primary)]">{user.full_name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[160px]">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{user.department || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[var(--color-brand-light)] text-brand capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{formatDate(user.created_at)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={user.is_active ? 'success' : 'default'} dot>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
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
