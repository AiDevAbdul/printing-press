import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Grid3x3, Clock } from 'lucide-react';
import { dispatchService } from '../../services/dispatch.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DispatchGrid } from './DispatchGrid';
import { DispatchTimeline } from './DispatchTimeline';
import DeliveryForm from './DeliveryForm';

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
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          placeholder="Search by delivery #, customer, or job..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'packed', label: 'Packed' },
            { value: 'dispatched', label: 'Dispatched' },
            { value: 'in_transit', label: 'In Transit' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'failed', label: 'Failed' },
            { value: 'returned', label: 'Returned' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <DispatchGrid
          deliveries={filteredDeliveries}
          isLoading={isLoading}
        />
      ) : (
        <DispatchTimeline
          deliveries={filteredDeliveries}
          isLoading={isLoading}
        />
      )}

      {/* Form Modal */}
      {showForm && <DeliveryForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default Dispatch;
