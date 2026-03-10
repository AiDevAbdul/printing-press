import React, { forwardRef } from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, className = '', disabled, ...props }, ref) => {
    const baseClasses =
      'w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200';

    const disabledClasses = disabled
      ? 'cursor-not-allowed opacity-60'
      : 'cursor-pointer';

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={`${baseClasses} ${disabledClasses} ${className}`}
            disabled={disabled}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm">
            <label
              className={`font-medium text-gray-700 ${
                disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
              }`}
            >
              {label}
            </label>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            {helperText && !error && (
              <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
