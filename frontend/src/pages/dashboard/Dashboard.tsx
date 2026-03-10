import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboard.service';
import { formatCurrency } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const modulesByCategory = {
  Sales: [
    { icon: '👥', title: 'Customers', path: '/customers', color: 'from-purple-500 to-purple-600', description: 'Manage customer database' },
    { icon: '📄', title: 'Quotations', path: '/quotations', color: 'from-yellow-500 to-yellow-600', description: 'Create & track quotes' },
    { icon: '📦', title: 'Orders', path: '/orders', color: 'from-green-500 to-green-600', description: 'Order management' },
  ],
  Production: [
    { icon: '📋', title: 'Planning', path: '/planning', color: 'from-blue-500 to-blue-600', description: 'Production planning' },
    { icon: '🏭', title: 'Production', path: '/production', color: 'from-orange-500 to-orange-600', description: 'Active production jobs' },
    { icon: '⚙️', title: 'Shop Floor', path: '/shop-floor', color: 'from-gray-600 to-gray-700', description: 'Floor operations' },
    { icon: '✓', title: 'Quality', path: '/quality', color: 'from-teal-500 to-teal-600', description: 'Quality control' },
    { icon: '📉', title: 'Wastage', path: '/wastage-analytics', color: 'from-red-500 to-red-600', description: 'Wastage analytics' },
  ],
  Logistics: [
    { icon: '🚚', title: 'Dispatch', path: '/dispatch', color: 'from-indigo-500 to-indigo-600', description: 'Dispatch management' },
    { icon: '📋', title: 'Inventory', path: '/inventory', color: 'from-cyan-500 to-cyan-600', description: 'Stock management' },
  ],
  Finance: [
    { icon: '💵', title: 'Costing', path: '/costing', color: 'from-emerald-500 to-emerald-600', description: 'Cost calculations' },
    { icon: '💰', title: 'Invoices', path: '/invoices', color: 'from-amber-500 to-amber-600', description: 'Invoice management' },
  ],
  System: [
    { icon: '👤', title: 'Users', path: '/users', color: 'from-pink-500 to-pink-600', description: 'User management' },
  ],
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
        <div className="max-w-[1600px] mx-auto animate-pulse space-y-6">
          <div className="h-12 bg-white/50 rounded-xl w-80"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 bg-white/50 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-96 bg-white/50 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Printing Press Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">{currentDate}</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 hover:text-blue-600">
              📊 Reports
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-medium">
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => navigate('/orders')}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  📦
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.orders.total || 0}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="flex-1 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-medium text-center">
                  Pending: {stats?.orders.pending || 0}
                </span>
                <span className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium text-center">
                  Active: {stats?.orders.in_production || 0}
                </span>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/production')}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  🏭
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Production Jobs</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.production_jobs.total || 0}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="flex-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium text-center">
                  Active: {productionStatus?.in_progress || 0}
                </span>
                <span className="flex-1 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-medium text-center">
                  Queued: {stats?.production_jobs.queued || 0}
                </span>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/inventory')}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  📋
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Low Stock Alert</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.low_stock_items || 0}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 bg-orange-50 px-3 py-1.5 rounded-lg text-center">
                Items need reordering
              </p>
            </div>
          </div>

          <div
            onClick={() => navigate('/invoices')}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  💰
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Pending Invoices</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats?.pending_invoices_amount || 0)}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 bg-purple-50 px-3 py-1.5 rounded-lg text-center">
                Outstanding amount
              </p>
            </div>
          </div>
        </div>

        {/* Production Status Section */}
        {productionStatus && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Production Overview</h2>
              <button
                onClick={() => navigate('/production')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-5 group hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                    {productionStatus.in_progress || 0}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-900">In Progress</p>
                    <p className="text-xs text-green-700">Active production jobs</p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-5 group hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                    {productionStatus.scheduled_today || 0}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Scheduled Today</p>
                    <p className="text-xs text-blue-700">Jobs starting today</p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-50 to-red-100 p-5 group hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                    {productionStatus.overdue || 0}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-900">Overdue</p>
                    <p className="text-xs text-red-700">Require immediate attention</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modules by Category */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Access Modules</h2>

          <div className="space-y-6">
            {Object.entries(modulesByCategory).map(([category, modules]) => (
              <div key={category}>
                <div
                  className="flex items-center gap-3 mb-4 cursor-pointer group"
                  onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                >
                  <h3 className="text-lg font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                    {category}
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {modules.length} modules
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {modules.map((module) => (
                    <div
                      key={module.path}
                      onClick={() => navigate(module.path)}
                      className="group relative bg-white border-2 border-gray-100 rounded-xl hover:border-transparent hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                      <div className="relative p-4">
                        <div className="flex flex-col items-center text-center">
                          <div className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">
                            {module.icon}
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-white transition-colors mb-1">
                            {module.title}
                          </h4>
                          <p className="text-xs text-gray-500 group-hover:text-white/90 transition-colors">
                            {module.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
