import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const location = useLocation();

  // Auto-generate breadcrumbs from route if items not provided
  const breadcrumbItems = items || generateBreadcrumbs(location.pathname);

  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`} aria-label="Breadcrumb">
      <Link
        to="/"
        className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
      </Link>

      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// Helper function to generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Route label mapping
  const labelMap: Record<string, string> = {
    customers: 'Customers',
    quotations: 'Quotations',
    orders: 'Orders',
    production: 'Production',
    planning: 'Planning',
    'shop-floor': 'Shop Floor',
    quality: 'Quality',
    wastage: 'Wastage',
    dispatch: 'Dispatch',
    inventory: 'Inventory',
    costing: 'Costing',
    invoices: 'Invoices',
    users: 'Users',
    dashboard: 'Dashboard',
    new: 'New',
    edit: 'Edit',
    view: 'View',
  };

  paths.forEach((path, index) => {
    const href = '/' + paths.slice(0, index + 1).join('/');
    const label = labelMap[path] || path.charAt(0).toUpperCase() + path.slice(1);

    breadcrumbs.push({ label, href });
  });

  return breadcrumbs;
}
