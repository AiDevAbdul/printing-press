'use client';

import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const Icon = variant === 'danger' ? AlertTriangle : Info;
  const iconBg = variant === 'danger'
    ? 'bg-[var(--color-danger-bg)]'
    : 'bg-[var(--color-brand-light)]';
  const iconColor = variant === 'danger'
    ? 'text-[var(--color-danger)]'
    : 'text-[var(--color-brand)]';

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      size="sm"
      showCloseButton={false}
      closeOnOverlayClick={!isLoading}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex gap-4 py-1">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${iconBg} flex items-center justify-center mt-0.5`}>
          <Icon className={`w-5 h-5 ${iconColor}`} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)] leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
}
