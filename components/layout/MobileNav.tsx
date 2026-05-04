'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'
import { MODULE_ICONS } from '@/utils/iconMap'
import type { SidebarItem } from './Sidebar'

export interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  items: SidebarItem[]
  activeItem?: string
  onItemClick?: (itemId: string) => void
}

export function MobileNav({
  isOpen,
  onClose,
  items,
  activeItem,
  onItemClick,
}: MobileNavProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const handleItemClick = (item: SidebarItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id)
    } else {
      onItemClick?.(item.id)
      onClose()
    }
  }

  const renderItem = (item: SidebarItem, level = 0) => {
    const IconComponent = MODULE_ICONS[item.icon]
    const isExpanded = expandedItems.has(item.id)
    const isActive = activeItem === item.id
    const hasChildren = item.children && item.children.length > 0

    const content = (
      <>
        {IconComponent && <IconComponent className="w-6 h-6 flex-shrink-0" />}
        <span className="flex-1 text-left">{item.label}</span>
        {item.badge && (
          <span className="bg-danger text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {item.badge > 9 ? '9+' : item.badge}
          </span>
        )}
      </>
    )

    return (
      <div key={item.id}>
        {item.href ? (
          <Link href={item.href}>
            <button
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center gap-3 px-6 py-4 text-base font-medium transition-all duration-200 ${
                isActive ? 'bg-brand/10 text-brand border-l-4 border-brand' : 'text-text-primary active:bg-border'
              } ${level > 0 ? 'pl-12' : ''}`}
            >
              {content}
            </button>
          </Link>
        ) : (
          <button
            onClick={() => handleItemClick(item)}
            className={`w-full flex items-center gap-3 px-6 py-4 text-base font-medium transition-all duration-200 ${
              isActive ? 'bg-brand/10 text-brand border-l-4 border-brand' : 'text-text-primary active:bg-border'
            } ${level > 0 ? 'pl-12' : ''}`}
          >
            {content}
          </button>
        )}

        {hasChildren && isExpanded && (
          <div className="bg-page-bg">
            {item.children!.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Slide-out nav */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border z-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Menu</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-text-secondary hover:bg-border"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="py-3">
          {items.map((item) => renderItem(item))}
        </nav>
      </div>
    </>
  )
}
