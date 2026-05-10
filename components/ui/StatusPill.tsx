'use client';

import React from 'react';

export type StatusPillStatus =
  | 'queued' | 'running' | 'in_progress' | 'paused'
  | 'completed' | 'approved' | 'blocked' | 'pending' | 'cancelled';

export interface StatusPillProps {
  status: StatusPillStatus;
  label?: string;
  className?: string;
}

const config: Record<StatusPillStatus, { bg: string; text: string; pulse: boolean; defaultLabel: string }> = {
  running:     { bg: 'var(--color-info-bg)',     text: 'var(--color-info)',           pulse: true,  defaultLabel: 'Running' },
  in_progress: { bg: 'var(--color-info-bg)',     text: 'var(--color-info)',           pulse: true,  defaultLabel: 'In Progress' },
  queued:      { bg: '#F5F5F7',                  text: 'var(--color-text-secondary)', pulse: false, defaultLabel: 'Queued' },
  paused:      { bg: 'var(--color-warning-bg)',  text: 'var(--color-warning)',        pulse: false, defaultLabel: 'Paused' },
  completed:   { bg: 'var(--color-success-bg)',  text: 'var(--color-success)',        pulse: false, defaultLabel: 'Completed' },
  approved:    { bg: 'var(--color-success-bg)',  text: 'var(--color-success)',        pulse: false, defaultLabel: 'Approved' },
  blocked:     { bg: 'var(--color-danger-bg)',   text: 'var(--color-danger)',         pulse: true,  defaultLabel: 'Blocked' },
  pending:     { bg: 'var(--color-warning-bg)',  text: 'var(--color-warning)',        pulse: false, defaultLabel: 'Pending' },
  cancelled:   { bg: '#F5F5F7',                  text: 'var(--color-text-tertiary)',  pulse: false, defaultLabel: 'Cancelled' },
};

export function StatusPill({ status, label, className = '' }: StatusPillProps) {
  const c = config[status] ?? config.queued;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.pulse ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: c.text }}
        aria-hidden="true"
      />
      {label ?? c.defaultLabel}
    </span>
  );
}
