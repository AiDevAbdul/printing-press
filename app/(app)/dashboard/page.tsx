'use client'

import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { useState, useEffect } from 'react'
import type { SidebarItem } from '@/components/layout/Sidebar'

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setUser({
            name: data.name || 'User',
            email: data.email || '',
            role: data.role || '',
          })
        }
      } catch (err) {
        console.error('Failed to fetch user:', err)
      }
    }
    fetchUser()
  }, [])

  const navigationItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      href: '/dashboard',
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: 'orders',
      children: [
        { id: 'customers', label: 'Customers', icon: 'customers', href: '/customers' },
        { id: 'quotations', label: 'Quotations', icon: 'quotations', href: '/quotations' },
        { id: 'orders', label: 'Orders', icon: 'orders', href: '/orders' },
      ],
    },
    {
      id: 'production',
      label: 'Production',
      icon: 'production',
      children: [
        { id: 'prepress', label: 'Pre-Press', icon: 'prepress', href: '/prepress' },
        { id: 'production-jobs', label: 'Production', icon: 'production', href: '/production' },
        { id: 'shop-floor', label: 'Shop Floor', icon: 'shop-floor', href: '/shop-floor' },
        { id: 'quality', label: 'Quality', icon: 'quality', href: '/quality' },
      ],
    },
  ]

  const getActiveItem = () => {
    return 'dashboard'
  }

  return (
    <div className="min-h-screen flex flex-col bg-page-bg">
      <Header
        onMenuToggle={() => setMobileNavOpen(true)}
        user={user || undefined}
      />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            items={navigationItems}
            activeItem={getActiveItem()}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        </div>

        {/* Mobile Navigation */}
        <MobileNav
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          items={navigationItems}
          activeItem={getActiveItem()}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <main className="p-4 md:p-6">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
            <p className="text-text-secondary mb-6">Welcome to the Printing Press Management System</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface border border-border rounded-lg p-6 shadow-1">
                <div className="text-sm text-text-secondary mb-2">Total Orders</div>
                <div className="text-3xl font-bold text-text-primary">0</div>
                <div className="text-xs text-text-tertiary mt-2">Coming soon</div>
              </div>

              <div className="bg-surface border border-border rounded-lg p-6 shadow-1">
                <div className="text-sm text-text-secondary mb-2">In Production</div>
                <div className="text-3xl font-bold text-text-primary">0</div>
                <div className="text-xs text-text-tertiary mt-2">Coming soon</div>
              </div>

              <div className="bg-surface border border-border rounded-lg p-6 shadow-1">
                <div className="text-sm text-text-secondary mb-2">Quality Checks</div>
                <div className="text-3xl font-bold text-text-primary">0</div>
                <div className="text-xs text-text-tertiary mt-2">Coming soon</div>
              </div>

              <div className="bg-surface border border-border rounded-lg p-6 shadow-1">
                <div className="text-sm text-text-secondary mb-2">Pending Invoices</div>
                <div className="text-3xl font-bold text-text-primary">0</div>
                <div className="text-xs text-text-tertiary mt-2">Coming soon</div>
              </div>
            </div>

            <div className="mt-8 bg-surface border border-border rounded-lg p-6 shadow-1">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Next Steps</h2>
              <ul className="space-y-2 text-text-secondary">
                <li>✓ Phase 3 Step 1: Auth pages (Login, Company Selector) ported</li>
                <li>✓ Phase 3 Step 2: Layout components (Header, Sidebar) ported</li>
                <li>⏳ Phase 3 Step 3: UI components (Button, Input, Modal, etc.) to port</li>
                <li>⏳ Phase 3 Step 4: Remaining 28 pages to port</li>
                <li>⏳ Phase 4: API Route Handlers to implement</li>
              </ul>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
