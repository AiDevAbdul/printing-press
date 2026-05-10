'use client';

import React from 'react';

export type CompanySlug = 'cpp' | 'silvo' | 'bestfoil';

export interface CompanyBadgeProps {
  name: string;
  slug?: CompanySlug;
  size?: 'sm' | 'md';
  showDot?: boolean;
  active?: boolean;
  className?: string;
}

const slugColors: Record<CompanySlug, string> = {
  cpp:      '#1B4FDB',
  silvo:    '#0D7490',
  bestfoil: '#92400E',
};

function dotColor(name: string, slug?: CompanySlug): string {
  if (slug && slugColors[slug]) return slugColors[slug];
  const lower = name.toLowerCase();
  if (lower.includes('capital') || lower.includes('cpp')) return slugColors.cpp;
  if (lower.includes('silvo'))   return slugColors.silvo;
  if (lower.includes('foil') || lower.includes('best')) return slugColors.bestfoil;
  return 'var(--color-brand)';
}

export function CompanyBadge({
  name,
  slug,
  size = 'md',
  showDot = true,
  active = false,
  className = '',
}: CompanyBadgeProps) {
  const color = dotColor(name, slug);
  const isSm = size === 'sm';

  return (
    <span
      className={[
        'inline-flex items-center gap-2 rounded-lg font-medium transition-colors',
        isSm ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        active
          ? 'bg-[var(--color-brand-light)] text-[var(--color-brand)]'
          : 'bg-[var(--color-border-subtle)] text-[var(--color-text-primary)]',
        className,
      ].filter(Boolean).join(' ')}
    >
      {showDot && (
        <span
          className={`rounded-full flex-shrink-0 ${isSm ? 'w-2 h-2' : 'w-2.5 h-2.5'}`}
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      )}
      <span className="truncate">{name}</span>
    </span>
  );
}
