'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Calendar, AlertCircle, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

const VIEW_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'queued', label: 'Queued' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'all', label: 'All Jobs' },
];

async function fetchPlanningJobs(view: string) {
  const status = view === 'all' || view === 'upcoming' ? '' : view;
  const q = new URLSearchParams({ limit: '30' });
  if (status) q.set('status', status);
  const res = await fetch(`${API_BASE}/production?${q}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-PK', { weekday: 'short', day: '2-digit', month: 'short' });
}

function groupByDate(jobs: any[]) {
  const groups: Record<string, any[]> = {};
  for (const job of jobs) {
    const dateKey = job.scheduled_start_date
      ? new Date(job.scheduled_start_date).toDateString()
      : 'Unscheduled';
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(job);
  }
  return groups;
}

export default function Planning() {
  const router = useRouter();
  const [view, setView] = useState('upcoming');

  const { data, isLoading, error } = useQuery({
    queryKey: ['planning', view],
    queryFn: () => fetchPlanningJobs(view),
  });

  const jobs: any[] = data?.data ?? [];

  const filtered = view === 'upcoming'
    ? jobs.filter(j => j.scheduled_start_date && new Date(j.scheduled_start_date) >= new Date())
           .sort((a, b) => new Date(a.scheduled_start_date).getTime() - new Date(b.scheduled_start_date).getTime())
    : jobs;

  const groups = groupByDate(filtered);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Planning</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {data ? `${filtered.length} scheduled jobs` : 'Production schedule and capacity planning'}
          </p>
        </div>
        <div className="w-44">
          <Select options={VIEW_OPTIONS} value={view} onChange={(e) => setView(e.target.value)} fullWidth />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" className="h-32" />)}
        </div>
      ) : error ? (
        <EmptyState icon={<AlertCircle />} title="Failed to load schedule" description="Check your connection and try again." />
      ) : !filtered.length ? (
        <EmptyState icon={<Calendar />} title="No scheduled jobs" description="No production jobs match the current view." />
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([dateKey, dayJobs]) => (
            <div key={dateKey}>
              <div className="flex items-center gap-3 mb-3">
                <div className="px-3 py-1 bg-brand text-white text-xs font-semibold rounded-full">
                  {dateKey === 'Unscheduled' ? 'Unscheduled' : formatDate(new Date(dateKey).toISOString()) ?? dateKey}
                </div>
                <div className="flex-1 h-px bg-[var(--color-border-subtle)]" />
                <span className="text-xs text-[var(--color-text-tertiary)]">{dayJobs.length} job{dayJobs.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2">
                {dayJobs.map((job: any) => (
                  <Card
                    key={job.id}
                    variant="outlined"
                    padding="md"
                    hover
                    onClick={() => router.push(`/production/${job.id}`)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-1 h-12 rounded-full bg-brand shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-semibold text-[var(--color-text-primary)]">{job.job_number}</span>
                          <Badge variant="status" status={job.status as any} dot>{job.status.replace(/_/g, ' ')}</Badge>
                        </div>
                        <div className="flex gap-4 mt-1 text-xs text-[var(--color-text-secondary)]">
                          {job.assigned_machine && <span>Machine: {job.assigned_machine}</span>}
                          {job.estimated_hours && <span>Est: {job.estimated_hours}h</span>}
                          {job.scheduled_end_date && <span>→ {formatDate(job.scheduled_end_date)}</span>}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
