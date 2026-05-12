'use client';

import React, { forwardRef, useId } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    const borderCls = error
      ? 'border-danger focus:border-danger focus:ring-danger'
      : success
      ? 'border-success focus:border-success focus:ring-success'
      : 'border-[var(--color-border)] focus:border-brand focus:ring-brand';

    const paddingCls = leftIcon ? 'pl-10' : rightIcon || error || success ? 'pr-10' : '';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5"
          >
            {label}
            {required && (
              <span className="ml-1 text-danger" aria-hidden="true">*</span>
            )}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'h-10 w-full px-3 text-sm rounded-md',
              'bg-surface text-[var(--color-text-primary)]',
              'border transition-all duration-fast',
              'placeholder:text-[var(--color-text-tertiary)]',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:bg-[var(--color-page-bg)] disabled:opacity-50 disabled:cursor-not-allowed',
              borderCls,
              paddingCls,
              fullWidth ? 'w-full' : '',
              className,
            ].filter(Boolean).join(' ')}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={errorId || helperId}
            {...props}
          />
          {!error && !success && rightIcon && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}
          {error && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 text-danger"
              aria-hidden="true"
            >
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          {success && !error && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 text-success"
              aria-hidden="true"
            >
              <CheckCircle className="w-4 h-4" />
            </div>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-xs text-danger"
            role="alert"
          >
            {error}
          </p>
        )}
        {success && !error && (
          <p className="mt-1.5 text-xs text-success" role="status">
            {success}
          </p>
        )}
        {helperText && !error && !success && (
          <p id={helperId} className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
