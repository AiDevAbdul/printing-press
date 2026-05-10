'use client';

import React, { useRef, useState } from 'react';
import { Bell, Check, Loader, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

async function patchNotification(id: string, body: object) {
  const res = await fetch(`/api/notifications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update notification');
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ data: Notification[] }>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications?limit=15', { credentials: 'include' });
      if (!res.ok) throw new Error();
      return res.json();
    },
    staleTime: 30_000,
    enabled: isOpen,
  });

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = useMutation({
    mutationFn: (id: string) => patchNotification(id, { read: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => patchNotification(n.id, { read: true })));
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors duration-200"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-danger)] animate-pulse"
            aria-hidden="true"
          />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div
            ref={panelRef}
            className="absolute right-0 mt-2 w-80 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] z-50 overflow-hidden animate-fadeInScale"
            style={{ boxShadow: 'var(--shadow-3)' }}
            role="dialog"
            aria-label="Notifications"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-xs rounded-full bg-[var(--color-brand)] text-white leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] font-medium px-2 py-1 rounded transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-page-bg)] transition-colors"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader className="w-5 h-5 animate-spin text-[var(--color-text-tertiary)]" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Bell className="w-8 h-8 text-[var(--color-text-tertiary)] mx-auto mb-2" aria-hidden="true" />
                  <p className="text-sm text-[var(--color-text-secondary)]">All caught up</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={[
                      'flex gap-3 px-4 py-3 border-b border-[var(--color-border)] last:border-0 transition-colors',
                      !n.read ? 'bg-[var(--color-brand-light)]/30 hover:bg-[var(--color-brand-light)]/50' : 'hover:bg-[var(--color-page-bg)]',
                    ].join(' ')}
                  >
                    {!n.read && (
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] flex-shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <div className="flex-1 min-w-0" style={n.read ? { paddingLeft: '18px' } : {}}>
                      <p className={`text-sm leading-snug ${n.read ? 'text-[var(--color-text-secondary)]' : 'font-medium text-[var(--color-text-primary)]'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                    {!n.read && (
                      <button
                        onClick={() => markRead.mutate(n.id)}
                        className="flex-shrink-0 p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-brand)] hover:bg-[var(--color-brand-light)] transition-colors self-start mt-0.5"
                        aria-label="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
