'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserCog, Search, AlertCircle, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { usersService, type User } from '@/lib/services/users.service';

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin:     { bg: '#EDE9FE', text: '#7C3AED' },
  sales:     { bg: '#DBEAFE', text: '#2563EB' },
  planner:   { bg: '#D1FAE5', text: '#059669' },
  accounts:  { bg: '#FEF3C7', text: '#D97706' },
  inventory: { bg: '#FCE7F3', text: '#DB2777' },
};

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function UserManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['users-mgmt', page, search],
    queryFn: () => usersService.getAll({ page, limit: 20, search: search || undefined }),
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  const totalPages = data?.pages ?? 1;

  const adminCount = data?.data.filter(u => u.role === 'admin').length ?? 0;
  const activeCount = data?.data.filter(u => u.is_active).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">User Management</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {data ? `${data.total} users · ${activeCount} active · ${adminCount} admins` : 'Manage team access and roles'}
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

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="card" className="h-36" />)}
        </div>
      ) : error ? (
        <EmptyState icon={<AlertCircle />} title="Failed to load users" description="Check your connection and try again." />
      ) : !data?.data.length ? (
        <EmptyState icon={<UserCog />} title="No users found" description={search ? 'Try a different search.' : 'No users in this company.'} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((user: User) => {
              const roleColor = ROLE_COLORS[user.role] ?? { bg: '#F5F5F7', text: 'var(--color-text-secondary)' };
              return (
                <Card key={user.id} variant="elevated" padding="md" hover className="cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {getInitials(user.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[var(--color-text-primary)] truncate">{user.full_name}</p>
                        {!user.is_active && (
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">Inactive</span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: roleColor.bg, color: roleColor.text }}>
                          {user.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                          {user.role}
                        </span>
                        {user.department && (
                          <span className="text-xs text-[var(--color-text-tertiary)]">· {user.department}</span>
                        )}
                      </div>
                      <div className="mt-2 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">Joined {formatDate(user.created_at)}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={data.total} itemsPerPage={20} />
          )}
        </>
      )}
    </div>
  );
}
