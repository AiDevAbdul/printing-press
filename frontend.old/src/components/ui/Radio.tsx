import React, { forwardRef } from 'react';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className = '', disabled, ...props }, ref) => {
    const baseClasses =
      'w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200';

    const disabledClasses = disabled
      ? 'cursor-not-allowed opacity-60'
      : 'cursor-pointer';

    return (
      <div className="flex items-center">
        <input
          ref={ref}
          type="radio"
          className={`${baseClasses} ${disabledClasses} ${className}`}
          disabled={disabled}
          {...props}
        />
        {label && (
          <label
            className={`ml-2 text-sm font-medium text-gray-700 ${
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
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="space-y-2">{children}</div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
