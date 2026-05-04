'use client';

import React, { forwardRef } from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, className = '', disabled, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = error ? `${checkboxId}-error` : undefined;
    const helperId = helperText ? `${checkboxId}-helper` : undefined;

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={[
              'w-4 h-4 rounded',
              'border border-[var(--color-border)]',
              'checked:bg-brand checked:border-brand',
              'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2',
              'transition-all duration-fast',
              disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
              className,
            ].filter(Boolean).join(' ')}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={errorId || helperId}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm">
            <label
              htmlFor={checkboxId}
              className={`font-medium text-[var(--color-text-primary)] ${
                disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
              }`}
            >
              {label}
            </label>
            {error && (
              <p id={errorId} className="mt-1 text-xs text-danger" role="alert">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p id={helperId} className="mt-1 text-xs text-[var(--color-text-secondary)]">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
