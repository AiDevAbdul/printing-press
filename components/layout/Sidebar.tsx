'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { MODULE_ICONS } from '@/utils/iconMap'

export interface SidebarItem {
  id: string
  label: string
  icon: keyof typeof MODULE_ICONS
  href?: string
  children?: SidebarItem[]
  badge?: number
}

export interface SidebarProps {
  items: SidebarItem[]
  activeItem?: string
  onItemClick?: (itemId: string) => void
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  className?: string
}

export function Sidebar({
  items,
  activeItem,
  onItemClick,
  collapsed = false,
  onCollapsedChange,
  className = '',
}: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      next.has(itemId) ? next.delete(itemId) : next.add(itemId)
      return next
    })
  }

  const handleItemClick = (item: SidebarItem) => {
    if (item.children?.length) {
      toggleExpanded(item.id)
    } else if (item.href) {
      onItemClick?.(item.id)
    }
  }

  const renderItem = (item: SidebarItem, level = 0) => {
    const IconComponent = MODULE_ICONS[item.icon]
    const isExpanded = expandedItems.has(item.id)
    const isActive = activeItem === item.id || pathname.startsWith(item.href || '')
    const hasChildren = !!item.children?.length

    return (
      <div key={item.id}>
        {item.href ? (
          <Link href={item.href}>
            <button
              onClick={() => handleItemClick(item)}
              aria-current={isActive ? 'page' : undefined}
              aria-expanded={hasChildren ? isExpanded : undefined}
              aria-label={`${item.label}${item.badge ? `, ${item.badge} items` : ''}${hasChildren ? ', submenu' : ''}`}
              className={[
                'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md mx-1',
                'transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                level > 0 ? 'ml-5' : '',
                isActive
                  ? 'bg-brand/10 text-brand'
                  : 'text-text-secondary hover:bg-border hover:text-text-primary',
              ].join(' ')}
            >
              {IconComponent && <IconComponent className="w-[18px] h-[18px] flex-shrink-0" />}
              {!collapsed && (
                <>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.badge != null && (
                    <span className="bg-danger text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                  {hasChildren && (
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  )}
                </>
              )}
            </button>
          </Link>
        ) : (
          <button
            onClick={() => handleItemClick(item)}
            aria-expanded={hasChildren ? isExpanded : undefined}
            className={[
              'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md mx-1',
              'transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
              level > 0 ? 'ml-5' : '',
              'text-text-secondary hover:bg-border hover:text-text-primary',
            ].join(' ')}
          >
            {IconComponent && <IconComponent className="w-[18px] h-[18px] flex-shrink-0" />}
            {!collapsed && (
              <>
                <span className="flex-1 text-left truncate">{item.label}</span>
                {hasChildren && (
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  />
                )}
              </>
            )}
          </button>
        )}

        {hasChildren && isExpanded && !collapsed && (
          <div role="region" aria-label={`${item.label} submenu`}>
            {item.children!.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      className={[
        collapsed ? 'w-[60px]' : 'w-64',
        'bg-surface border-r border-border',
        'transition-all duration-200 flex flex-col h-screen overflow-y-auto',
        'flex-shrink-0',
        className,
      ].join(' ')}
      role="complementary"
      aria-label="Main navigation"
    >
      {/* Logo row */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-7 h-7 rounded-md bg-brand flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="text-sm font-semibold text-text-primary truncate">PrintFlow</span>
          </div>
        )}
        <button
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-border transition-colors duration-200 ml-auto"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav items */}
      <nav
        className="flex-1 py-3 space-y-0.5"
        role="navigation"
        aria-label="Sidebar navigation"
      >
        {items.map((item) => renderItem(item))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-border">
          <p className="text-xs text-text-tertiary text-center">© 2026 PrintFlow</p>
        </div>
      )}
    </aside>
  )
}
