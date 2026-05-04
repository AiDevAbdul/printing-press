'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  const labelMap: Record<string, string> = {
    customers: 'Customers',
    quotations: 'Quotations',
    orders: 'Orders',
    production: 'Production',
    planning: 'Planning',
    'shop-floor': 'Shop Floor',
    quality: 'Quality',
    wastage: 'Wastage Analytics',
    dispatch: 'Dispatch',
    inventory: 'Inventory',
    costing: 'Costing',
    invoices: 'Invoices',
    users: 'Users',
    'user-management': 'User Management',
    dashboard: 'Dashboard',
    prepress: 'Pre-Press',
    specifications: 'Specifications',
    'qa-approval': 'QA Approval',
    workflow: 'Workflow',
    profile: 'Profile',
    'activity-log': 'Activity Log',
    notifications: 'Notifications',
    new: 'New',
    edit: 'Edit',
    view: 'View',
  }

  paths.forEach((path, index) => {
    const label = labelMap[path] || path.charAt(0).toUpperCase() + path.slice(1)
    const href = '/' + paths.slice(0, index + 1).join('/')
    breadcrumbs.push({ label, href: index < paths.length - 1 ? href : undefined })
  })

  return breadcrumbs
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const pathname = usePathname()
  const breadcrumbItems = items || generateBreadcrumbs(pathname)

  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`} aria-label="Breadcrumb">
      <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors" aria-label="Home">
        <Home className="w-4 h-4" />
      </Link>

      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1

        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-text-tertiary" />
            {item.href && !isLast ? (
              <Link href={item.href} className="text-text-secondary hover:text-text-primary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-text-primary font-medium' : 'text-text-secondary'}>
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
