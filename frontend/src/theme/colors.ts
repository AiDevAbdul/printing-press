// Color constants for easy import and usage

export const COLORS = {
  // Primary brand colors
  PRIMARY: '#2563eb',
  PRIMARY_HOVER: '#1d4ed8',
  PRIMARY_LIGHT: '#dbeafe',

  // Secondary colors
  SECONDARY: '#4f46e5',
  SECONDARY_HOVER: '#4338ca',
  SECONDARY_LIGHT: '#e0e7ff',

  // Status colors
  SUCCESS: '#16a34a',
  SUCCESS_LIGHT: '#dcfce7',
  WARNING: '#d97706',
  WARNING_LIGHT: '#fef3c7',
  ERROR: '#dc2626',
  ERROR_LIGHT: '#fee2e2',
  INFO: '#0284c7',
  INFO_LIGHT: '#e0f2fe',

  // Neutral colors
  WHITE: '#ffffff',
  BLACK: '#000000',
  GRAY_50: '#f9fafb',
  GRAY_100: '#f3f4f6',
  GRAY_200: '#e5e7eb',
  GRAY_300: '#d1d5db',
  GRAY_400: '#9ca3af',
  GRAY_500: '#6b7280',
  GRAY_600: '#4b5563',
  GRAY_700: '#374151',
  GRAY_800: '#1f2937',
  GRAY_900: '#111827',

  // Background colors
  BG_PRIMARY: '#ffffff',
  BG_SECONDARY: '#f9fafb',
  BG_TERTIARY: '#f3f4f6',

  // Border colors
  BORDER_LIGHT: '#e5e7eb',
  BORDER_DEFAULT: '#d1d5db',
  BORDER_DARK: '#9ca3af',

  // Text colors
  TEXT_PRIMARY: '#111827',
  TEXT_SECONDARY: '#6b7280',
  TEXT_TERTIARY: '#9ca3af',
  TEXT_INVERSE: '#ffffff',
} as const;

// Status color mapping for badges and indicators
export const STATUS_COLORS = {
  pending: {
    bg: COLORS.WARNING_LIGHT,
    text: COLORS.WARNING,
    border: COLORS.WARNING,
  },
  approved: {
    bg: COLORS.INFO_LIGHT,
    text: COLORS.INFO,
    border: COLORS.INFO,
  },
  in_progress: {
    bg: COLORS.PRIMARY_LIGHT,
    text: COLORS.PRIMARY,
    border: COLORS.PRIMARY,
  },
  completed: {
    bg: COLORS.SUCCESS_LIGHT,
    text: COLORS.SUCCESS,
    border: COLORS.SUCCESS,
  },
  delivered: {
    bg: COLORS.SUCCESS_LIGHT,
    text: COLORS.SUCCESS,
    border: COLORS.SUCCESS,
  },
  cancelled: {
    bg: COLORS.ERROR_LIGHT,
    text: COLORS.ERROR,
    border: COLORS.ERROR,
  },
  rejected: {
    bg: COLORS.ERROR_LIGHT,
    text: COLORS.ERROR,
    border: COLORS.ERROR,
  },
  paused: {
    bg: COLORS.GRAY_100,
    text: COLORS.GRAY_600,
    border: COLORS.GRAY_400,
  },
  queued: {
    bg: COLORS.GRAY_100,
    text: COLORS.GRAY_600,
    border: COLORS.GRAY_400,
  },
} as const;

// Priority color mapping
export const PRIORITY_COLORS = {
  low: {
    bg: COLORS.GRAY_100,
    text: COLORS.GRAY_600,
    border: COLORS.GRAY_400,
  },
  medium: {
    bg: COLORS.INFO_LIGHT,
    text: COLORS.INFO,
    border: COLORS.INFO,
  },
  high: {
    bg: COLORS.WARNING_LIGHT,
    text: COLORS.WARNING,
    border: COLORS.WARNING,
  },
  urgent: {
    bg: COLORS.ERROR_LIGHT,
    text: COLORS.ERROR,
    border: COLORS.ERROR,
  },
} as const;
