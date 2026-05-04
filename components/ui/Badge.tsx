'use client';

import React from 'react';

type StatusKey =
  | 'pending' | 'approved' | 'in_progress' | 'completed'
  | 'delivered' | 'cancelled' | 'rejected' | 'paused'
  | 'queued' | 'running' | 'blocked';

type PriorityKey = 'low' | 'medium' | 'high' | 'urgent';

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'status' | 'priority';
  status?: StatusKey;
  priority?: PriorityKey;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const statusColors: Record<StatusKey, { bg: string; text: string }> = {
  pending:     { bg: 'var(--color-warning-bg)',  text: 'var(--color-warning)' },
  approved:    { bg: 'var(--color-success-bg)',  text: 'var(--color-success)' },
  in_progress: { bg: 'var(--color-info-bg)',     text: 'var(--color-info)' },
  running:     { bg: 'var(--color-info-bg)',     text: 'var(--color-info)' },
  completed:   { bg: 'var(--color-success-bg)',  text: 'var(--color-success)' },
  delivered:   { bg: 'var(--color-success-bg)',  text: 'var(--color-success)' },
  cancelled:   { bg: '#F5F5F7',                  text: 'var(--color-text-secondary)' },
  rejected:    { bg: 'var(--color-danger-bg)',   text: 'var(--color-danger)' },
  blocked:     { bg: 'var(--color-danger-bg)',   text: 'var(--color-danger)' },
  paused:      { bg: 'var(--color-warning-bg)',  text: 'var(--color-warning)' },
  queued:      { bg: '#F5F5F7',                  text: 'var(--color-text-secondary)' },
};

const priorityColors: Record<PriorityKey, { bg: string; text: string }> = {
  low:    { bg: '#F5F5F7',                 text: 'var(--color-text-secondary)' },
  medium: { bg: 'var(--color-info-bg)',    text: 'var(--color-info)' },
  high:   { bg: 'var(--color-warning-bg)', text: 'var(--color-warning)' },
  urgent: { bg: 'var(--color-danger-bg)',  text: 'var(--color-danger)' },
};

const variantStyles: Record<string, { bg: string; text: string }> = {
  default: { bg: '#F5F5F7',                  text: 'var(--color-text-secondary)' },
  success: { bg: 'var(--color-success-bg)',  text: 'var(--color-success)' },
  warning: { bg: 'var(--color-warning-bg)',  text: 'var(--color-warning)' },
  danger:  { bg: 'var(--color-danger-bg)',   text: 'var(--color-danger)' },
  info:    { bg: 'var(--color-info-bg)',     text: 'var(--color-info)' },
  brand:   { bg: 'var(--color-brand-light)', text: 'var(--color-brand)' },
};

export function Badge({
  variant = 'default',
  status,
  priority,
  dot = false,
  children,
  className = '',
}: BadgeProps) {
  let colors: { bg: string; text: string };

  if (variant === 'status' && status && statusColors[status]) {
    colors = statusColors[status];
  } else if (variant === 'priority' && priority && priorityColors[priority]) {
    colors = priorityColors[priority];
  } else {
    colors = variantStyles[variant] ?? variantStyles.default;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: colors.text }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
