import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { Menu } from 'lucide-react';

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

export function Header({
  onMenuToggle,
  user,
  onLogout,
  className = '',
}: HeaderProps) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  return (
    <header
      className={`bg-white border-b border-gray-200 sticky top-0 z-40 ${className}`}
      role="banner"
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Mobile menu toggle + Breadcrumb */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile menu toggle */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Toggle navigation menu"
            aria-expanded="false"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Breadcrumb - hidden on mobile */}
          <div className="hidden md:block">
            <Breadcrumb />
          </div>
        </div>

        {/* Center: Search bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search..."
              aria-label="Search"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Right: Notifications + User menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              onKeyDown={(e) => handleKeyDown(e, () => setShowNotifications(!showNotifications))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative"
              aria-label="Notifications"
              aria-expanded={showNotifications}
              aria-haspopup="true"
            >
              <Bell className="w-5 h-5 text-gray-600" aria-hidden="true" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-label="Unread notifications"></span>
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-fadeInScale"
                role="region"
                aria-label="Notifications panel"
              >
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer" role="article">
                    <p className="text-sm text-gray-900">New order received</p>
                    <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer" role="article">
                    <p className="text-sm text-gray-900">Production job completed</p>
                    <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              onKeyDown={(e) => handleKeyDown(e, () => setShowUserMenu(!showUserMenu))}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label={`User menu for ${user?.name || 'User'}`}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div
                className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium"
                aria-hidden="true"
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600 hidden md:block" aria-hidden="true" />
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-fadeInScale"
                role="menu"
                aria-label="User options"
              >
                {user && (
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1 capitalize">{user.role}</p>
                  </div>
                )}
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  role="menuitem"
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                  Profile
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setShowUserMenu(false)}
                  role="menuitem"
                >
                  <Settings className="w-4 h-4" aria-hidden="true" />
                  Settings
                </button>
                <hr className="my-2 border-gray-200" />
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout?.();
                  }}
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </header>
  );
}
