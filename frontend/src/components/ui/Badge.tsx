import React from 'react';
import { COLORS, STATUS_COLORS, PRIORITY_COLORS } from '../../theme/colors';

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'status' | 'priority';
  status?: keyof typeof STATUS_COLORS;
  priority?: keyof typeof PRIORITY_COLORS;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = 'default',
  status,
  priority,
  children,
  className = '',
}: BadgeProps) {
  let bgColor: string = COLORS.GRAY_100;
  let textColor: string = COLORS.GRAY_600;
  let borderColor: string = COLORS.GRAY_400;

  if (variant === 'status' && status && STATUS_COLORS[status]) {
    const colors = STATUS_COLORS[status];
    bgColor = colors.bg;
    textColor = colors.text;
    borderColor = colors.border;
  } else if (variant === 'priority' && priority && PRIORITY_COLORS[priority]) {
    const colors = PRIORITY_COLORS[priority];
    bgColor = colors.bg;
    textColor = colors.text;
    borderColor = colors.border;
  } else {
    const variantMap: Record<string, { bg: string; text: string; border: string }> = {
      default: { bg: COLORS.GRAY_100, text: COLORS.GRAY_600, border: COLORS.GRAY_400 },
      success: { bg: COLORS.SUCCESS_LIGHT, text: COLORS.SUCCESS, border: COLORS.SUCCESS },
      warning: { bg: COLORS.WARNING_LIGHT, text: COLORS.WARNING, border: COLORS.WARNING },
      error: { bg: COLORS.ERROR_LIGHT, text: COLORS.ERROR, border: COLORS.ERROR },
      info: { bg: COLORS.INFO_LIGHT, text: COLORS.INFO, border: COLORS.INFO },
      status: { bg: COLORS.GRAY_100, text: COLORS.GRAY_600, border: COLORS.GRAY_400 },
      priority: { bg: COLORS.GRAY_100, text: COLORS.GRAY_600, border: COLORS.GRAY_400 },
    };
    const colors = variantMap[variant];
    bgColor = colors.bg;
    textColor = colors.text;
    borderColor = colors.border;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderColor: borderColor,
      }}
    >
      {children}
    </span>
  );
}
