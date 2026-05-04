import { useState } from 'react';
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { MODULE_ICONS } from '../../utils/iconMap';

export interface SidebarItem {
  id: string;
  label: string;
  icon: keyof typeof MODULE_ICONS;
  href?: string;
  children?: SidebarItem[];
  badge?: number;
}

export interface SidebarProps {
  items: SidebarItem[];
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
}

export function Sidebar({
  items,
  activeItem,
  onItemClick,
  collapsed = false,
  onCollapsedChange,
  className = '',
}: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.children?.length) {
      toggleExpanded(item.id);
    } else if (item.href) {
      onItemClick?.(item.id);
    }
  };

  const renderItem = (item: SidebarItem, level = 0) => {
    const IconComponent = MODULE_ICONS[item.icon];
    const isExpanded = expandedItems.has(item.id);
    const isActive = activeItem === item.id;
    const hasChildren = !!item.children?.length;

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          aria-current={isActive ? 'page' : undefined}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-label={`${item.label}${item.badge ? `, ${item.badge} items` : ''}${hasChildren ? ', submenu' : ''}`}
          className={[
            'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md mx-1',
            'transition-all duration-fast',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
            level > 0 ? 'ml-5' : '',
            isActive
              ? 'bg-brand-light text-brand'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]',
          ].join(' ')}
        >
          {IconComponent && (
            <IconComponent
              className="w-[18px] h-[18px] flex-shrink-0"
              aria-hidden="true"
            />
          )}
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.badge != null && (
                <span
                  className="bg-danger text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0"
                  aria-label={`${item.badge} items`}
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
              {hasChildren && (
                <ChevronDown
                  className={`w-4 h-4 flex-shrink-0 transition-transform duration-fast ${isExpanded ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              )}
            </>
          )}
        </button>

        {hasChildren && isExpanded && !collapsed && (
          <div role="region" aria-label={`${item.label} submenu`}>
            {item.children!.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={[
        collapsed ? 'w-[60px]' : 'w-60',
        'bg-surface border-r border-[var(--color-border-subtle)]',
        'transition-all duration-normal flex flex-col h-screen overflow-y-auto',
        'flex-shrink-0',
        className,
      ].join(' ')}
      style={{ transitionTimingFunction: 'var(--ease-out)' }}
      role="complementary"
      aria-label="Main navigation"
    >
      {/* Logo / Brand row */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-[var(--color-border-subtle)]">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-1">
            <div
              className="w-7 h-7 rounded-md bg-brand flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
              PrintFlow
            </span>
          </div>
        )}
        <button
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="p-1.5 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] transition-colors duration-fast ml-auto"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="w-4 h-4" aria-hidden="true" />
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
        <div className="px-4 py-3 border-t border-[var(--color-border-subtle)]">
          <p className="text-xs text-[var(--color-text-tertiary)] text-center">
            © 2026 PrintFlow
          </p>
        </div>
      )}
    </aside>
  );
}
