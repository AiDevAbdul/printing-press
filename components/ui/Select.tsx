'use client';

import React, { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: Array<{ value: string | number; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      options,
      className = '',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || `select-${generatedId}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;

    const borderCls = error
      ? 'border-danger focus:border-danger focus:ring-danger'
      : 'border-[var(--color-border)] focus:border-brand focus:ring-brand';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={[
              'h-10 w-full px-3 pr-10 text-sm rounded-md',
              'bg-surface text-[var(--color-text-primary)]',
              'border transition-all duration-fast appearance-none',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:bg-[var(--color-page-bg)] disabled:opacity-50 disabled:cursor-not-allowed',
              borderCls,
              fullWidth ? 'w-full' : '',
              className,
            ].filter(Boolean).join(' ')}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={errorId || helperId}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-danger" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
