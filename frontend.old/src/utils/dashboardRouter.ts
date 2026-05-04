/**
 * Maps user roles to their corresponding dashboard routes
 */
export const getDashboardRoute = (role: string): string => {
  const roleRoutes: Record<string, string> = {
    prepress: '/dashboard/prepress',
    operator: '/dashboard/production',
    planner: '/dashboard/production',
    qa_manager: '/dashboard/quality',
    sales: '/dashboard/sales',
    analyst: '/dashboard/analytics',
    accounts: '/dashboard/finance',
    inventory: '/dashboard/inventory',
    admin: '/dashboard',
  };
  return roleRoutes[role] || '/dashboard';
};

/**
 * Gets navigation items based on user role
 */
export const getNavigationByRole = (role: string): string[] => {
  const navigationMap: Record<string, string[]> = {
    prepress: ['prepress', 'specifications', 'design'],
    operator: ['production', 'shop-floor', 'quality'],
    planner: ['production', 'planning', 'workflow'],
    qa_manager: ['quality', 'qa-approval', 'dispatch'],
    sales: ['customers', 'orders', 'quotations'],
    analyst: ['wastage-analytics', 'costing'],
    accounts: ['invoices', 'costing'],
    inventory: ['inventory'],
    admin: ['all'],
  };
  return navigationMap[role] || [];
};
