'use client';

import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}: AlertProps) {
  const variantConfig = {
    info: {
      bg: 'var(--color-info-bg)',
      border: 'var(--color-info)',
      text: 'var(--color-info)',
      icon: Info,
      iconColor: 'var(--color-info)',
    },
    success: {
      bg: 'var(--color-success-bg)',
      border: 'var(--color-success)',
      text: 'var(--color-success)',
      icon: CheckCircle,
      iconColor: 'var(--color-success)',
    },
    warning: {
      bg: 'var(--color-warning-bg)',
      border: 'var(--color-warning)',
      text: 'var(--color-warning)',
      icon: AlertTriangle,
      iconColor: 'var(--color-warning)',
    },
    error: {
      bg: 'var(--color-danger-bg)',
      border: 'var(--color-danger)',
      text: 'var(--color-danger)',
      icon: AlertCircle,
      iconColor: 'var(--color-danger)',
    },
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <div
      className={`border rounded-lg p-4 ${className}`}
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.text,
      }}
    >
      <div className="flex items-start gap-3">
        <IconComponent className="w-5 h-5 flex-shrink-0" style={{ color: config.iconColor }} />
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Close alert"
            style={{ color: config.iconColor }}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
