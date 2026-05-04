import React from 'react';
import { Loader } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantCls = {
  primary:
    'bg-brand text-white hover:bg-brand-dark shadow-1 hover:shadow-2',
  accent:
    'bg-accent text-white hover:bg-accent-dark shadow-1 hover:shadow-2',
  secondary:
    'bg-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]',
  danger:
    'bg-danger text-white hover:bg-[#e62e25] shadow-1 hover:shadow-2',
  ghost:
    'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]',
  outline:
    'bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)]',
};

const sizeCls = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-md',
  lg: 'h-12 px-5 text-sm gap-2 rounded-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  disabled,
  fullWidth = false,
  className = '',
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center font-medium select-none cursor-pointer',
        'transition-all duration-fast',
        'active:scale-[0.97]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        variantCls[variant],
        sizeCls[size],
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      style={{ transitionTimingFunction: 'var(--ease-spring)', ...style }}
      {...props}
    >
      {isLoading ? (
        <Loader className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : icon ? (
        <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
