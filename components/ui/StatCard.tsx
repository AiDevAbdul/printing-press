'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from './Card';

type Accent = 'brand' | 'success' | 'warning' | 'danger' | 'info';

const ACCENT: Record<Accent, { icon: string; iconBg: string; subBg: string; subText: string }> = {
  brand:   { icon: 'var(--color-brand)',   iconBg: 'var(--color-brand)',   subBg: 'var(--color-brand-light)',  subText: 'var(--color-brand)' },
  success: { icon: 'var(--color-success)', iconBg: 'var(--color-success)', subBg: 'var(--color-success-bg)',   subText: 'var(--color-success)' },
  warning: { icon: 'var(--color-warning)', iconBg: 'var(--color-warning)', subBg: 'var(--color-warning-bg)',   subText: 'var(--color-warning)' },
  danger:  { icon: 'var(--color-danger)',  iconBg: 'var(--color-danger)',  subBg: 'var(--color-danger-bg)',    subText: 'var(--color-danger)' },
  info:    { icon: 'var(--color-info)',    iconBg: 'var(--color-info)',    subBg: 'var(--color-info-bg)',      subText: 'var(--color-info)' },
};

export interface StatBadge {
  label: string;
  variant?: Accent;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: Accent;
  href?: string;
  badges?: StatBadge[];
  trend?: string;
}

export function StatCard({ label, value, icon, accent = 'brand', href, badges, trend }: StatCardProps) {
  const router = useRouter();
  const a = ACCENT[accent];

  return (
    <Card
      variant="elevated"
      padding="md"
      hover={!!href}
      onClick={href ? () => router.push(href) : undefined}
      className={href ? 'cursor-pointer' : ''}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: a.iconBg }}
          >
            <span className="text-white [&_svg]:w-5 [&_svg]:h-5">{icon}</span>
          </div>
          <div className="text-right min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] leading-tight">{label}</p>
            <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-1 tabular-nums">{value}</p>
            {trend && <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{trend}</p>}
          </div>
        </div>

        {badges && badges.length > 0 && (
          <div className="flex gap-2">
            {badges.map((b, i) => {
              const ba = ACCENT[b.variant ?? 'brand'];
              return (
                <span
                  key={i}
                  className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold text-center truncate"
                  style={{ backgroundColor: ba.subBg, color: ba.subText }}
                >
                  {b.label}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
