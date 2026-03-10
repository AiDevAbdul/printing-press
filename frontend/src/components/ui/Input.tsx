import React, { forwardRef } from 'react';
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
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    const baseClasses =
      'px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';

    const stateClasses = error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : success
      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

    const disabledClasses = disabled
      ? 'bg-gray-100 cursor-not-allowed opacity-60'
      : 'bg-white';

    const widthClass = fullWidth ? 'w-full' : '';

    const paddingClasses = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`${baseClasses} ${stateClasses} ${disabledClasses} ${widthClass} ${paddingClasses} ${className}`}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={errorId || helperId}
            {...props}
          />
          {rightIcon && !error && !success && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
              {rightIcon}
            </div>
          )}
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" aria-hidden="true">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          {success && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" aria-hidden="true">
              <CheckCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-1 text-sm text-green-600" role="status">
            {success}
          </p>
        )}
        {helperText && !error && !success && (
          <p id={helperId} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
