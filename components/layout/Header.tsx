'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Settings, ChevronDown, Menu } from 'lucide-react'
import { Breadcrumb } from './Breadcrumb'
import { CompanySwitcher } from './CompanySwitcher'
import { NotificationBell } from '@/components/ui/NotificationBell'
import { toast } from 'sonner'

export interface HeaderProps {
  onMenuToggle?: () => void
  user?: {
    name: string
    email: string
    role: string
  }
  className?: string
}

export function Header({ onMenuToggle, user, className = '' }: HeaderProps) {
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      toast.success('Logged out')
      router.push('/login')
    } catch (err) {
      console.error('Logout error:', err)
      toast.error('Failed to logout')
    }
  }

  const handleClickOutside = (e: React.MouseEvent) => {
    if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
      setShowUserMenu(false)
    }
  }

  const initials = user?.name?.charAt(0)?.toUpperCase() || 'U'

  return (
    <header
      className={[
        'bg-surface/90 border-b border-border sticky top-0 z-40',
        'backdrop-blur-md',
        className,
      ].join(' ')}
      role="banner"
    >
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md text-text-secondary hover:bg-border transition-colors duration-200"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:block min-w-0">
            <Breadcrumb />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          <CompanySwitcher />

          <NotificationBell />

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-border transition-colors duration-200"
              aria-label={`User menu for ${user?.name || 'User'}`}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {initials}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-text-tertiary hidden md:block" />
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-52 bg-surface rounded-xl border border-border py-1 shadow-3 z-50 overflow-hidden"
                role="menu"
                aria-label="User options"
                onClick={handleClickOutside}
              >
                {user && (
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                    <p className="text-xs text-text-secondary truncate mt-0.5">{user.email}</p>
                    <p className="text-xs text-text-tertiary mt-0.5 capitalize">{user.role}</p>
                  </div>
                )}
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-page-bg hover:text-text-primary transition-colors duration-200"
                  onClick={() => {
                    setShowUserMenu(false)
                    router.push('/profile')
                  }}
                  role="menuitem"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-page-bg hover:text-text-primary transition-colors duration-200"
                  onClick={() => setShowUserMenu(false)}
                  role="menuitem"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <div className="my-1 border-t border-border" />
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors duration-200"
                  onClick={() => {
                    setShowUserMenu(false)
                    handleLogout()
                  }}
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
