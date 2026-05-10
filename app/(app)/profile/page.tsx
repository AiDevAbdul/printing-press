'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Mail, Phone, Building2, ShieldCheck, AlertCircle, Edit3 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function fetchMe() {
  const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin:          { bg: '#EDE9FE', text: '#7C3AED' },
  sales:          { bg: '#DBEAFE', text: '#2563EB' },
  planner:        { bg: '#D1FAE5', text: '#059669' },
  accounts:       { bg: '#FEF3C7', text: '#D97706' },
  inventory:      { bg: '#FCE7F3', text: '#DB2777' },
  prepress:       { bg: '#E0F2FE', text: '#0369A1' },
  production:     { bg: '#DCFCE7', text: '#15803D' },
  quality:        { bg: '#FFF7ED', text: '#C2410C' },
};

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function UserProfile() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['profile-me'],
    queryFn: fetchMe,
  });

  const user = data?.user;
  const companies: any[] = data?.companies ?? [];
  const roleColor = user ? (ROLE_COLORS[user.role] ?? { bg: '#F5F5F7', text: 'var(--color-text-secondary)' }) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Profile</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Your account information</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton variant="card" className="h-48" />
          <Skeleton variant="card" className="h-32" />
        </div>
      ) : error ? (
        <EmptyState icon={<AlertCircle />} title="Failed to load profile" description="Check your connection and try again." />
      ) : user ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2 space-y-4">
            <Card variant="elevated" padding="lg">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-brand flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {getInitials(user.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{user.full_name}</h2>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {roleColor && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: roleColor.bg, color: roleColor.text }}>
                            {user.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5" />}
                            {user.role}
                          </span>
                        )}
                        {user.is_super_admin && (
                          <Badge variant="brand">Super Admin</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2.5 text-sm text-[var(--color-text-secondary)]">
                      <Mail className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2.5 text-sm text-[var(--color-text-secondary)]">
                        <Phone className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.department && (
                      <div className="flex items-center gap-2.5 text-sm text-[var(--color-text-secondary)]">
                        <Building2 className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
                        <span>{user.department}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 text-sm text-[var(--color-text-secondary)]">
                      <User className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
                      <span className="font-mono text-xs">{user.id?.slice(0, 8)}…</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Company Access */}
          <div className="space-y-4">
            <Card variant="elevated" padding="lg">
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Company Access
              </h3>
              {companies.length === 0 ? (
                <p className="text-sm text-[var(--color-text-tertiary)]">No companies assigned</p>
              ) : (
                <div className="space-y-2">
                  {companies.map((c: any) => (
                    <div key={c.id} className="flex items-center gap-2 p-2.5 bg-[var(--color-page-bg)] rounded-lg">
                      <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {c.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{c.name}</p>
                        {c.id === user.companyId && (
                          <p className="text-xs text-brand">Current</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
