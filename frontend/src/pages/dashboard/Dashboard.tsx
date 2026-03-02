import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboard.service';
import { formatCurrency } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import MenuGroup from '../../components/dashboard/MenuGroup';

const menuGroups = [
  {
    title: 'Sales & Customer Management',
    icon: '🤝',
    cards: [
      { icon: '👥', title: 'Customers', description: 'Manage customer database', path: '/customers', color: 'bg-purple-500' },
      { icon: '📄', title: 'Quotations', description: 'Create and track quotations', path: '/quotations', color: 'bg-yellow-500' },
      { icon: '📦', title: 'Orders', description: 'Order management and tracking', path: '/orders', color: 'bg-green-500' },
    ],
  },
  {
    title: 'Production & Operations',
    icon: '🏭',
    cards: [
      { icon: '🏭', title: 'Production', description: 'Production job management', path: '/production', color: 'bg-orange-500' },
      { icon: '⚙️', title: 'Shop Floor', description: 'Real-time shop floor monitoring', path: '/shop-floor', color: 'bg-gray-500' },
      { icon: '✓', title: 'Quality', description: 'Quality control and inspections', path: '/quality', color: 'bg-teal-500' },
      { icon: '📉', title: 'Wastage', description: 'Wastage analytics and tracking', path: '/wastage-analytics', color: 'bg-red-500' },
    ],
  },
  {
    title: 'Logistics & Fulfillment',
    icon: '🚚',
    cards: [
      { icon: '🚚', title: 'Dispatch', description: 'Dispatch management and tracking', path: '/dispatch', color: 'bg-indigo-500' },
      { icon: '📋', title: 'Inventory', description: 'Stock management and tracking', path: '/inventory', color: 'bg-cyan-500' },
    ],
  },
  {
    title: 'Finance & Administration',
    icon: '💰',
    cards: [
      { icon: '💵', title: 'Costing', description: 'Cost calculations and analysis', path: '/costing', color: 'bg-emerald-500' },
      { icon: '💰', title: 'Invoices', description: 'Invoice generation and management', path: '/invoices', color: 'bg-amber-500' },
    ],
  },
  {
    title: 'System Management',
    icon: '⚙️',
    cards: [
      { icon: '👤', title: 'Users', description: 'User management and permissions', path: '/users', color: 'bg-pink-500' },
    ],
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  const { data: productionStatus, isLoading: productionLoading } = useQuery({
    queryKey: ['production-status'],
    queryFn: dashboardService.getProductionStatus,
  });

  if (statsLoading || productionLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Orders */}
        <div
          onClick={() => navigate('/orders')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Total Orders</h3>
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats?.orders.total || 0}</p>
          <div className="mt-3 flex gap-4 text-xs">
            <span className="text-yellow-600">Pending: {stats?.orders.pending || 0}</span>
            <span className="text-blue-600">In Production: {stats?.orders.in_production || 0}</span>
          </div>
        </div>

        {/* Production Jobs */}
        <div
          onClick={() => navigate('/production-jobs')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-green-500"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Production Jobs</h3>
            <span className="text-2xl">🏭</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats?.production_jobs.total || 0}</p>
          <div className="mt-3 flex gap-4 text-xs">
            <span className="text-green-600">In Progress: {productionStatus?.in_progress || 0}</span>
            <span className="text-yellow-600">Queued: {stats?.production_jobs.queued || 0}</span>
          </div>
        </div>

        {/* Low Stock Items */}
        <div
          onClick={() => navigate('/inventory')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-orange-500"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Low Stock Items</h3>
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats?.low_stock_items || 0}</p>
          <p className="mt-3 text-xs text-gray-500">Items need reordering</p>
        </div>

        {/* Pending Invoices */}
        <div
          onClick={() => navigate('/invoices')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-purple-500"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Pending Invoices</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats?.pending_invoices_amount || 0)}</p>
          <p className="mt-3 text-xs text-gray-500">Outstanding amount</p>
        </div>
      </div>

      {/* Menu Groups */}
      {menuGroups.map((group) => (
        <MenuGroup key={group.title} {...group} />
      ))}
    </div>
  );
}
