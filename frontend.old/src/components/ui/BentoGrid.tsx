import React from 'react';

export interface BentoGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colCls = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

const gapCls = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-5',
};

export function BentoGrid({
  children,
  columns = 3,
  gap = 'md',
  className = '',
}: BentoGridProps) {
  return (
    <div className={`grid ${colCls[columns]} ${gapCls[gap]} ${className}`}>
      {children}
    </div>
  );
}

/** Span a bento cell across multiple columns or rows */
export interface BentoCellProps {
  children: React.ReactNode;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
  className?: string;
}

const colSpanCls = {
  1: '',
  2: 'sm:col-span-2',
  3: 'sm:col-span-2 lg:col-span-3',
  4: 'sm:col-span-2 lg:col-span-4',
};

const rowSpanCls = {
  1: '',
  2: 'row-span-2',
};

export function BentoCell({
  children,
  colSpan = 1,
  rowSpan = 1,
  className = '',
}: BentoCellProps) {
  return (
    <div
      className={[
        colSpanCls[colSpan],
        rowSpanCls[rowSpan],
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}
