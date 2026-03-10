import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
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
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
    } else if (item.href) {
      onItemClick?.(item.id);
    }
  };

  const renderItem = (item: SidebarItem, level = 0) => {
    const IconComponent = MODULE_ICONS[item.icon];
    const isExpanded = expandedItems.has(item.id);
    const isActive = activeItem === item.id;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          aria-current={isActive ? 'page' : undefined}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-label={`${item.label}${item.badge ? `, ${item.badge} items` : ''}${hasChildren ? ', submenu' : ''}`}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
            isActive
              ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
              : 'text-gray-700 hover:bg-gray-50'
          } ${level > 0 ? 'ml-4' : ''}`}
        >
          {IconComponent && <IconComponent className="w-5 h-5 flex-shrink-0" aria-hidden="true" />}
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span
                  className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  aria-label={`${item.badge} unread items`}
                >
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              )}
            </>
          )}
        </button>

        {hasChildren && isExpanded && !collapsed && (
          <div className="bg-gray-50" role="region" aria-label={`${item.label} submenu`}>
            {item.children!.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen overflow-y-auto ${className}`}
      role="complementary"
      aria-label="Main navigation"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && <h1 className="text-lg font-bold text-gray-900">Menu</h1>}
        <button
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <Menu className="w-5 h-5" aria-hidden="true" />
          ) : (
            <X className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 space-y-1" role="navigation" aria-label="Sidebar navigation">
        {items.map((item) => renderItem(item))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-500 text-center">
        {!collapsed && <p>© 2026 Printing Press</p>}
      </div>
    </aside>
  );
}
