import { useState } from 'react';
import { X } from 'lucide-react';
import { MODULE_ICONS } from '../../utils/iconMap';
import { SidebarItem } from './Sidebar';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  items: SidebarItem[];
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

export function MobileNav({
  isOpen,
  onClose,
  items,
  activeItem,
  onItemClick,
}: MobileNavProps) {
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
    } else {
      onItemClick?.(item.id);
      onClose();
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
          className={`w-full flex items-center gap-3 px-6 py-4 text-base font-medium transition-all duration-200 ${
            isActive
              ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
              : 'text-gray-700 active:bg-gray-50'
          } ${level > 0 ? 'pl-12' : ''}`}
        >
          {IconComponent && <IconComponent className="w-6 h-6 flex-shrink-0" />}
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {item.badge}
            </span>
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="bg-gray-50">
            {item.children!.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden shadow-2xl animate-slideIn overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="py-4">
          {items.map((item) => renderItem(item))}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 text-sm text-gray-500 text-center">
          <p>© 2026 Printing Press</p>
        </div>
      </div>
    </>
  );
}
