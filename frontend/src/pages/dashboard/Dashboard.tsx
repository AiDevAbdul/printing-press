import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboard.service';
import { formatCurrency } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Package,
  Factory,
  AlertTriangle,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  const { data: productionStatus, isLoading: productionLoading, error: productionError } = useQuery({
    queryKey: ['production-status'],
    queryFn: dashboardService.getProductionStatus,
  });

  if (statsLoading || productionLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton variant="text" className="h-10 w-80" />
            <Skeleton variant="text" className="h-4 w-60" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  if (statsError || productionError) {
    return (
      <EmptyState
        icon={<AlertCircle />}
        title="Error loading dashboard"
        description="There was an error loading the dashboard data. Please try again."
      />
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">{currentDate}</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          variant="elevated"
          padding="md"
          hover
          onClick={() => navigate('/orders')}
          className="cursor-pointer"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
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
        </Card>

        <Card
          variant="elevated"
          padding="md"
          hover
          onClick={() => navigate('/production')}
          className="cursor-pointer"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Factory className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Production Jobs</p>
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
        </Card>

        <Card
          variant="elevated"
          padding="md"
          hover
          onClick={() => navigate('/inventory')}
          className="cursor-pointer"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Low Stock Alert</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.low_stock_items || 0}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 bg-orange-50 px-3 py-1.5 rounded-lg text-center">
              Items need reordering
            </p>
          </div>
        </Card>

        <Card
          variant="elevated"
          padding="md"
          hover
          onClick={() => navigate('/invoices')}
          className="cursor-pointer"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats?.pending_invoices_amount || 0)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 bg-purple-50 px-3 py-1.5 rounded-lg text-center">
              Outstanding amount
            </p>
          </div>
        </Card>
      </div>

      {/* Production Status Section */}
      {productionStatus && (
        <Card variant="elevated" padding="lg">
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
            <Card variant="outlined" padding="md" className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {productionStatus.in_progress || 0}
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-900">In Progress</p>
                  <p className="text-xs text-green-700">Active production jobs</p>
                </div>
              </div>
            </Card>

            <Card variant="outlined" padding="md" className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {productionStatus.scheduled_today || 0}
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Scheduled Today</p>
                  <p className="text-xs text-blue-700">Jobs starting today</p>
                </div>
              </div>
            </Card>

            <Card variant="outlined" padding="md" className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {productionStatus.overdue || 0}
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-900">Overdue</p>
                  <p className="text-xs text-red-700">Require immediate attention</p>
                </div>
              </div>
            </Card>
          </div>
        </Card>
      )}
    </div>
  );
}
