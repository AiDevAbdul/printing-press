'use client';

import { useQuery } from '@tanstack/react-query';
import { TrendingDown, AlertCircle, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function fetchWastage() {
  const res = await fetch(`${API_BASE}/production?status=completed&limit=50`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

const WASTAGE_TYPES = [
  { key: 'startup', label: 'Startup Waste', color: 'bg-blue-400', description: 'Material used during machine setup' },
  { key: 'overrun', label: 'Overrun', color: 'bg-orange-400', description: 'Production exceeding order quantity' },
  { key: 'defect', label: 'Defect Waste', color: 'bg-red-400', description: 'Rejected or defective output' },
  { key: 'trim', label: 'Trim Waste', color: 'bg-purple-400', description: 'Material removed during cutting' },
];

export default function WastageAnalytics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['wastage-analytics'],
    queryFn: fetchWastage,
  });

  const completedJobs = data?.data ?? [];
  const totalJobs = completedJobs.length;
  const jobsWithActualHours = completedJobs.filter((j: any) => j.actual_hours && j.estimated_hours);
  const avgEfficiency = jobsWithActualHours.length > 0
    ? Math.round(jobsWithActualHours.reduce((sum: number, j: any) => sum + (j.estimated_hours / j.actual_hours) * 100, 0) / jobsWithActualHours.length)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Wastage Analytics</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Track and analyse material wastage across production jobs
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" className="h-28" />)}
        </div>
      ) : error ? (
        <EmptyState icon={<AlertCircle />} title="Failed to load data" description="Check your connection and try again." />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="elevated" padding="md">
              <p className="text-sm text-[var(--color-text-secondary)]">Completed Jobs</p>
              <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">{totalJobs}</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">analysed this period</p>
            </Card>
            <Card variant="elevated" padding="md">
              <p className="text-sm text-[var(--color-text-secondary)]">Avg. Efficiency</p>
              <p className="text-3xl font-bold mt-1" style={{ color: avgEfficiency && avgEfficiency >= 90 ? 'var(--color-success)' : avgEfficiency && avgEfficiency >= 70 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                {avgEfficiency !== null ? `${avgEfficiency}%` : '—'}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">estimated vs actual hours</p>
            </Card>
            <Card variant="elevated" padding="md">
              <p className="text-sm text-[var(--color-text-secondary)]">Over-Time Jobs</p>
              <p className="text-3xl font-bold text-danger mt-1">
                {jobsWithActualHours.filter((j: any) => j.actual_hours > j.estimated_hours).length}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">exceeded estimated hours</p>
            </Card>
            <Card variant="elevated" padding="md">
              <p className="text-sm text-[var(--color-text-secondary)]">On-Time Jobs</p>
              <p className="text-3xl font-bold text-success mt-1">
                {jobsWithActualHours.filter((j: any) => j.actual_hours <= j.estimated_hours).length}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">within estimated hours</p>
            </Card>
          </div>

          {/* Wastage Type Breakdown */}
          <Card variant="elevated" padding="lg">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Wastage Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {WASTAGE_TYPES.map(type => (
                <div key={type.key} className="flex items-start gap-3 p-3 bg-[var(--color-page-bg)] rounded-xl">
                  <div className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${type.color}`} />
                  <div>
                    <p className="font-medium text-sm text-[var(--color-text-primary)]">{type.label}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{type.description}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Detailed tracking requires wastage records API</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Job Hours Table */}
          {jobsWithActualHours.length > 0 ? (
            <Card variant="elevated" padding="none">
              <div className="px-4 py-3 border-b border-[var(--color-border-subtle)]">
                <h2 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />Job Efficiency Breakdown
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-page-bg)]">
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Job #</th>
                      <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">Estimated</th>
                      <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">Actual</th>
                      <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">Efficiency</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Machine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-subtle)]">
                    {jobsWithActualHours.slice(0, 20).map((job: any) => {
                      const eff = Math.round((job.estimated_hours / job.actual_hours) * 100);
                      return (
                        <tr key={job.id}>
                          <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-primary)]">{job.job_number}</td>
                          <td className="px-4 py-3 text-right text-[var(--color-text-secondary)]">{job.estimated_hours}h</td>
                          <td className="px-4 py-3 text-right text-[var(--color-text-secondary)]">{job.actual_hours}h</td>
                          <td className="px-4 py-3 text-right font-semibold" style={{ color: eff >= 90 ? 'var(--color-success)' : eff >= 70 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                            {eff}%
                          </td>
                          <td className="px-4 py-3 text-[var(--color-text-secondary)]">{job.assigned_machine || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card variant="elevated" padding="lg">
              <EmptyState icon={<TrendingDown />} title="No efficiency data yet" description="Job efficiency data appears here once production jobs have both estimated and actual hours recorded." />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
