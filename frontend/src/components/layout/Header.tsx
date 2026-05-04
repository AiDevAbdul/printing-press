import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Settings, ChevronDown, X, Check, Menu } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { CompanySwitcher } from './CompanySwitcher';
import notificationsService, { Notification } from '../../services/notifications.service';

export interface HeaderProps {
  onMenuToggle?: () => void;
  user?: {
    name: string;
    email: string;
    role: string;
  };
  onLogout?: () => void;
  className?: string;
}

export function Header({ onMenuToggle, user, onLogout, className = '' }: HeaderProps) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationsService.getNotifications(10, 0);
        setNotifications(response.data || []);
        const count = await notificationsService.getUnreadCount();
        setUnreadCount(count);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    if (showNotifications) fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [showNotifications]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((n) => n.map((x) => x.id === id ? { ...x, is_read: true } : x));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationsService.deleteNotification(id);
      setNotifications((n) => n.filter((x) => x.id !== id));
    } catch { /* silent */ }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((n) => n.map((x) => ({ ...x, is_read: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const formatTimeAgo = (dateString: string) => {
    const secs = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (secs < 60) return 'just now';
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
  };

  const initials = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header
      className={[
        'bg-surface/90 border-b border-[var(--color-border-subtle)] sticky top-0 z-40',
        className,
      ].join(' ')}
      style={{ backdropFilter: 'blur(var(--glass-blur-md))' }}
      role="banner"
    >
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] transition-colors duration-fast"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="hidden md:block min-w-0">
            <Breadcrumb />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          <CompanySwitcher />

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] transition-colors duration-fast"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              aria-expanded={showNotifications}
              aria-haspopup="true"
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger text-white rounded-full flex items-center justify-center text-[10px] font-bold"
                  aria-label={`${unreadCount} unread`}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 bg-surface rounded-xl border border-[var(--color-border-subtle)] py-1 animate-fadeInScale z-50 overflow-hidden"
                style={{ boxShadow: 'var(--shadow-3)' }}
                role="region"
                aria-label="Notifications panel"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-subtle)]">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-brand hover:text-brand-dark font-medium transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                    <p className="px-4 py-6 text-sm text-center text-[var(--color-text-tertiary)]">
                      Loading…
                    </p>
                  ) : notifications.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-center text-[var(--color-text-tertiary)]">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-[var(--color-border-subtle)] group transition-colors duration-fast ${
                          !n.is_read ? 'bg-brand-light' : 'hover:bg-[var(--color-page-bg)]'
                        }`}
                        role="article"
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!n.is_read ? 'font-semibold text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                            {formatTimeAgo(n.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-fast flex-shrink-0">
                          {!n.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(n.id)}
                              className="p-1 rounded hover:bg-[var(--color-border-subtle)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                              aria-label="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(n.id)}
                            className="p-1 rounded hover:bg-[var(--color-border-subtle)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                            aria-label="Delete"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[var(--color-border-subtle)] transition-colors duration-fast"
              aria-label={`User menu for ${user?.name || 'User'}`}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div
                className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold flex-shrink-0"
                aria-hidden="true"
              >
                {initials}
              </div>
              <ChevronDown
                className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] hidden md:block"
                aria-hidden="true"
              />
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-52 bg-surface rounded-xl border border-[var(--color-border-subtle)] py-1 animate-fadeInScale z-50 overflow-hidden"
                style={{ boxShadow: 'var(--shadow-3)' }}
                role="menu"
                aria-label="User options"
              >
                {user && (
                  <div className="px-4 py-3 border-b border-[var(--color-border-subtle)]">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">
                      {user.email}
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 capitalize">
                      {user.role}
                    </p>
                  </div>
                )}
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-page-bg)] hover:text-[var(--color-text-primary)] transition-colors duration-fast"
                  onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                  role="menuitem"
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                  Profile
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-page-bg)] hover:text-[var(--color-text-primary)] transition-colors duration-fast"
                  onClick={() => setShowUserMenu(false)}
                  role="menuitem"
                >
                  <Settings className="w-4 h-4" aria-hidden="true" />
                  Settings
                </button>
                <div className="my-1 border-t border-[var(--color-border-subtle)]" />
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger hover:bg-danger-bg transition-colors duration-fast"
                  onClick={() => { setShowUserMenu(false); onLogout?.(); }}
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
