'use client'

import { ReactNode, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import type { SidebarItem } from '@/components/layout/Sidebar'

const NAV_ITEMS: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
  { id: 'customers', label: 'Customers', icon: 'customers', href: '/customers' },
  { id: 'orders', label: 'Orders', icon: 'orders', href: '/orders' },
  { id: 'quotations', label: 'Quotations', icon: 'quotations', href: '/quotations' },
  { id: 'invoices', label: 'Invoices', icon: 'invoices', href: '/invoices' },
  { id: 'prepress', label: 'Pre-Press', icon: 'prepress', href: '/prepress' },
  { id: 'qa-approval', label: 'QA Approval', icon: 'qa-approval', href: '/qa-approval' },
  { id: 'specifications', label: 'Specifications', icon: 'specifications', href: '/specifications' },
  { id: 'production', label: 'Production', icon: 'production', href: '/production' },
  { id: 'planning', label: 'Planning', icon: 'planning', href: '/planning' },
  { id: 'shop-floor', label: 'Shop Floor', icon: 'shop-floor', href: '/shop-floor' },
  { id: 'workflow', label: 'Workflow', icon: 'workflow', href: '/workflow' },
  { id: 'quality', label: 'Quality', icon: 'quality', href: '/quality' },
  { id: 'dispatch', label: 'Dispatch', icon: 'dispatch', href: '/dispatch' },
  { id: 'inventory', label: 'Inventory', icon: 'inventory', href: '/dashboards/inventory' },
  { id: 'costing', label: 'Costing', icon: 'costing', href: '/costing' },
  { id: 'wastage-analytics', label: 'Wastage Analytics', icon: 'wastage-analytics', href: '/wastage-analytics' },
  { id: 'users', label: 'Users', icon: 'users', href: '/users' },
  { id: 'user-management', label: 'User Management', icon: 'user-management', href: '/user-management' },
  { id: 'profile', label: 'Profile', icon: 'profile', href: '/profile' },
]

async function fetchMe() {
  const res = await fetch('/api/auth/me', { credentials: 'include' })
  if (!res.ok) return null
  return res.json()
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const pathname = usePathname()

  const { data: meData } = useQuery({
    queryKey: ['current-user'],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,
  })

  const user = meData?.user
    ? {
        name: meData.user.full_name || meData.user.email,
        email: meData.user.email,
        role: meData.user.role,
      }
    : undefined

  const activeItem = NAV_ITEMS.find(
    (item) => item.href && (pathname === item.href || pathname.startsWith(item.href + '/')),
  )?.id

  return (
    <div className="min-h-screen flex bg-page-bg">
      <div className="hidden lg:block">
        <Sidebar
          items={NAV_ITEMS}
          activeItem={activeItem}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>

      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        items={NAV_ITEMS}
        activeItem={activeItem}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setMobileNavOpen(true)} user={user} />
        <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
