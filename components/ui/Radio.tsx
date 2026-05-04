'use client';

import React, { forwardRef } from 'react';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className = '', disabled, id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="flex items-center">
        <input
          ref={ref}
          id={radioId}
          type="radio"
          className={[
            'w-4 h-4 rounded-full',
            'border-2 border-[var(--color-border)]',
            'checked:border-brand checked:ring-2 checked:ring-brand checked:ring-offset-1',
            'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1',
            'transition-all duration-fast',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
            className,
          ].filter(Boolean).join(' ')}
          disabled={disabled}
          {...props}
        />
        {label && (
          <label
            htmlFor={radioId}
            className={`ml-2 text-sm font-medium text-[var(--color-text-primary)] ${
              disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
            }`}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export interface RadioGroupProps {
  label?: string;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
}

export function RadioGroup({
  label,
  error,
  helperText,
  children,
  className = '',
}: RadioGroupProps) {
  const groupId = `radio-group-${Math.random().toString(36).slice(2, 9)}`;
  const errorId = error ? `${groupId}-error` : undefined;
  const helperId = helperText ? `${groupId}-helper` : undefined;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
          {label}
        </label>
      )}
      <div className="space-y-2" role="group">{children}</div>
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
  );
}
