import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Grid3x3, Clock } from 'lucide-react';
import { dispatchService } from '../../services/dispatch.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SortButton } from '../../components/ui/SortButton';
import { DispatchGrid } from './DispatchGrid';
import { DispatchTimeline } from './DispatchTimeline';
import DeliveryForm from './DeliveryForm';
import { useSorting } from '../../hooks/useSorting';

const Dispatch = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: deliveriesData, isLoading } = useQuery({
    queryKey: ['deliveries', statusFilter],
    queryFn: () =>
      dispatchService.getDeliveries({
        status: statusFilter === 'all' ? undefined : statusFilter,
      }),
  });

  const deliveries = deliveriesData?.data || [];

  const filteredDeliveries = deliveries.filter((delivery) =>
    delivery.delivery_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.job.job_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { sortedItems, sortConfig, toggleSort } = useSorting(filteredDeliveries, 'scheduled_date');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dispatch & Delivery</h1>
          <p className="text-gray-600 mt-1">Track and manage deliveries</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowForm(true)}
        >
          New Delivery
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            icon={<Grid3x3 className="w-4 h-4" />}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'primary' : 'ghost'}
            size="sm"
            icon={<Clock className="w-4 h-4" />}
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </Button>
        </div>
        <div className="flex gap-2">
          <SortButton
            label="Latest"
            isActive={sortConfig.key === 'scheduled_date'}
            sortOrder={sortConfig.order}
            onClick={() => toggleSort('scheduled_date')}
          />
          <SortButton
            label="Status"
            isActive={sortConfig.key === 'delivery_status'}
            sortOrder={sortConfig.order}
            onClick={() => toggleSort('delivery_status')}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          placeholder="Search by delivery #, customer, or job..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="packed">Packed</option>
          <option value="dispatched">Dispatched</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="failed">Failed</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <DispatchGrid
          deliveries={sortedItems}
          isLoading={isLoading}
        />
      ) : (
        <DispatchTimeline
          deliveries={sortedItems}
          isLoading={isLoading}
        />
      )}

      {/* Form Modal */}
      {showForm && <DeliveryForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default Dispatch;
