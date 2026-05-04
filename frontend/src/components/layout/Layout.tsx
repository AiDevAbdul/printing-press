import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar, SidebarItem } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isSuperAdmin } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Define navigation items based on user role
  const getNavigationItems = (): SidebarItem[] => {
    const allItems: SidebarItem[] = [
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
          { id: 'prepress', label: 'Pre-Press', icon: 'production', href: '/prepress' },
          { id: 'specifications', label: 'Specifications', icon: 'production', href: '/specifications' },
          { id: 'planning', label: 'Planning', icon: 'planning', href: '/planning' },
          { id: 'production-jobs', label: 'Production', icon: 'production', href: '/production' },
          { id: 'shop-floor', label: 'Shop Floor', icon: 'shop-floor', href: '/shop-floor' },
          { id: 'quality', label: 'Quality', icon: 'quality', href: '/quality' },
          { id: 'wastage', label: 'Wastage', icon: 'wastage', href: '/wastage-analytics' },
        ],
      },
      {
        id: 'logistics',
        label: 'Logistics',
        icon: 'dispatch',
        children: [
          { id: 'dispatch', label: 'Dispatch', icon: 'dispatch', href: '/dispatch' },
          { id: 'inventory', label: 'Inventory', icon: 'inventory', href: '/inventory' },
        ],
      },
      {
        id: 'finance',
        label: 'Finance',
        icon: 'costing',
        children: [
          { id: 'costing', label: 'Costing', icon: 'costing', href: '/costing' },
          { id: 'invoices', label: 'Invoices', icon: 'invoices', href: '/invoices' },
        ],
      },
    ];

    // Filter navigation based on role
    const roleNavigation: Record<string, string[]> = {
      prepress: ['dashboard', 'production'],
      operator: ['dashboard', 'production'],
      planner: ['dashboard', 'production'],
      qa_manager: ['dashboard', 'production'],
      sales: ['dashboard', 'sales'],
      analyst: ['dashboard', 'finance'],
      accounts: ['dashboard', 'finance'],
      inventory: ['dashboard', 'logistics'],
      admin: ['dashboard', 'sales', 'production', 'logistics', 'finance', 'system'],
    };

    const allowedSections = roleNavigation[user?.role] || ['dashboard'];

    // For super-admin, show all items
    if (isSuperAdmin || user?.role === 'admin') {
      const items = allItems.filter(item => allowedSections.includes(item.id));
      items.push({
        id: 'system',
        label: 'System',
        icon: 'users',
        children: [
          { id: 'user-management', label: 'Users', icon: 'users', href: '/user-management' },
        ],
      });
      return items;
    }

    return allItems.filter(item => allowedSections.includes(item.id));
  };

  const navigationItems = getNavigationItems();

  // Get active item from current path
  const getActiveItem = () => {
    const path = location.pathname.split('/')[1];
    return path || 'dashboard';
  };

  const handleItemClick = (itemId: string) => {
    const findItem = (items: SidebarItem[]): SidebarItem | undefined => {
      for (const item of items) {
        if (item.id === itemId) return item;
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
    };

    const item = findItem(navigationItems);
    if (item?.href) {
      navigate(item.href);
    }
  };

  return (
    <div className="min-h-dvh bg-page-bg flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          items={navigationItems}
          activeItem={getActiveItem()}
          onItemClick={handleItemClick}
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
        onItemClick={handleItemClick}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header
          onMenuToggle={() => setMobileNavOpen(true)}
          user={{
            name: user?.full_name || '',
            email: user?.email || '',
            role: user?.role || '',
          }}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
