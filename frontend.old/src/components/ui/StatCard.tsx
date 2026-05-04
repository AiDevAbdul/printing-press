import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  color?: 'brand' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
}

const colorTokens = {
  brand:   { icon: 'var(--color-brand)',   bg: 'var(--color-brand-light)' },
  success: { icon: 'var(--color-success)', bg: 'var(--color-success-bg)' },
  warning: { icon: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  danger:  { icon: 'var(--color-danger)',  bg: 'var(--color-danger-bg)' },
  info:    { icon: 'var(--color-info)',    bg: 'var(--color-info-bg)' },
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  color = 'brand',
  size = 'md',
  className = '',
  onClick,
}: StatCardProps) {
  const tokens = colorTokens[color];
  const trendPositive = trend && trend.value >= 0;

  return (
    <div
      className={[
        'bg-surface rounded-lg border border-[var(--color-border-subtle)] shadow-1',
        'transition-all duration-normal',
        size === 'md' ? 'p-5' : 'p-4',
        onClick ? 'cursor-pointer hover:shadow-2 hover:-translate-y-px' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={{ transitionTimingFunction: 'var(--ease-out)' }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide truncate">
            {label}
          </p>
          <p
            className={[
              'font-semibold text-[var(--color-text-primary)] mt-1 tabular-nums',
              size === 'md' ? 'text-2xl' : 'text-xl',
            ].join(' ')}
          >
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trendPositive ? (
                <TrendingUp
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: 'var(--color-success)' }}
                  aria-hidden="true"
                />
              ) : (
                <TrendingDown
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: 'var(--color-danger)' }}
                  aria-hidden="true"
                />
              )}
              <span
                className="text-xs font-medium"
                style={{ color: trendPositive ? 'var(--color-success)' : 'var(--color-danger)' }}
              >
                {trendPositive ? '+' : ''}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: tokens.bg, color: tokens.icon }}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
