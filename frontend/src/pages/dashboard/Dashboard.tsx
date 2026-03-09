import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboard.service';
import { formatCurrency } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

const allModules = [
  { icon: '👥', title: 'Customers', path: '/customers', category: 'Sales', color: 'from-purple-500 to-purple-600' },
  { icon: '📄', title: 'Quotations', path: '/quotations', category: 'Sales', color: 'from-yellow-500 to-yellow-600' },
  { icon: '📦', title: 'Orders', path: '/orders', category: 'Sales', color: 'from-green-500 to-green-600' },
  { icon: '📋', title: 'Planning', path: '/planning', category: 'Production', color: 'from-blue-500 to-blue-600' },
  { icon: '🏭', title: 'Production', path: '/production', category: 'Production', color: 'from-orange-500 to-orange-600' },
  { icon: '⚙️', title: 'Shop Floor', path: '/shop-floor', category: 'Production', color: 'from-gray-600 to-gray-700' },
  { icon: '✓', title: 'Quality', path: '/quality', category: 'Production', color: 'from-teal-500 to-teal-600' },
  { icon: '📉', title: 'Wastage', path: '/wastage-analytics', category: 'Production', color: 'from-red-500 to-red-600' },
  { icon: '🚚', title: 'Dispatch', path: '/dispatch', category: 'Logistics', color: 'from-indigo-500 to-indigo-600' },
  { icon: '📋', title: 'Inventory', path: '/inventory', category: 'Logistics', color: 'from-cyan-500 to-cyan-600' },
  { icon: '💵', title: 'Costing', path: '/costing', category: 'Finance', color: 'from-emerald-500 to-emerald-600' },
  { icon: '💰', title: 'Invoices', path: '/invoices', category: 'Finance', color: 'from-amber-500 to-amber-600' },
  { icon: '👤', title: 'Users', path: '/users', category: 'System', color: 'from-pink-500 to-pink-600' },
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white rounded-xl shadow"></div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="h-28 bg-white rounded-xl shadow"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your business overview</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Orders */}
          <div
            onClick={() => navigate('/orders')}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.orders.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                📦
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                Pending: {stats?.orders.pending || 0}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                Active: {stats?.orders.in_production || 0}
              </span>
            </div>
          </div>

          {/* Production Jobs */}
          <div
            onClick={() => navigate('/production')}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer p-6 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 font-medium">Production Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.production_jobs.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                🏭
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                Active: {productionStatus?.in_progress || 0}
              </span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                Queued: {stats?.production_jobs.queued || 0}
              </span>
            </div>
          </div>

          {/* Low Stock Items */}
          <div
            onClick={() => navigate('/inventory')}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer p-6 border-l-4 border-orange-500"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 font-medium">Low Stock Alert</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.low_stock_items || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                📋
              </div>
            </div>
            <p className="text-xs text-gray-500">Items need reordering</p>
          </div>

          {/* Pending Invoices */}
          <div
            onClick={() => navigate('/invoices')}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending Invoices</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats?.pending_invoices_amount || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                💰
              </div>
            </div>
            <p className="text-xs text-gray-500">Outstanding amount</p>
          </div>
        </div>

        {/* All Modules - Single Grid */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {allModules.map((module) => (
              <div
                key={module.path}
                onClick={() => navigate(module.path)}
                className={`bg-gradient-to-br ${module.color} rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer p-5 group`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {module.icon}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{module.title}</h3>
                  <span className="text-xs text-white/80">{module.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Production Status */}
        {productionStatus && (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Production Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                  {productionStatus.in_progress || 0}
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-xs text-gray-500">Active jobs</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                  {productionStatus.scheduled_today || 0}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Scheduled Today</p>
                  <p className="text-xs text-gray-500">Jobs to start</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                  {productionStatus.overdue || 0}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-xs text-gray-500">Need attention</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
