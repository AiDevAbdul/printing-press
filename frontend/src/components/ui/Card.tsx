import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantCls = {
  default:  'bg-surface border border-[var(--color-border-subtle)] shadow-1',
  elevated: 'bg-surface shadow-2',
  outlined: 'bg-surface border border-[var(--color-border)]',
  glass:    'glass-card',
};

const paddingCls = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-6',
};

export function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  children,
  className = '',
  onClick,
  style,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'rounded-lg',
        'transition-all duration-normal',
        variantCls[variant],
        paddingCls[padding],
        hover ? 'hover:shadow-3 hover:-translate-y-px cursor-pointer' : '',
        onClick ? 'cursor-pointer' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={{ transitionTimingFunction: 'var(--ease-out)', ...style }}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`border-b border-[var(--color-border-subtle)] pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-base font-semibold text-[var(--color-text-primary)] ${className}`}>
      {children}
    </h3>
  );
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`border-t border-[var(--color-border-subtle)] pt-4 mt-4 ${className}`}>
      {children}
    </div>
  );
}
