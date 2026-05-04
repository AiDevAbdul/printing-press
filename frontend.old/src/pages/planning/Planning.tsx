import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { SortButton } from '../../components/ui/SortButton';
import { useSorting } from '../../hooks/useSorting';

interface Order {
  id: string;
  order_number: string;
  customer: {
    name: string;
    company_name: string;
  };
  order_date: string;
  delivery_date: string;
  status: string;
  priority: string;
  product_name: string;
  quantity: number;
  unit: string;
  final_price: number;
  product_type?: string;
  strength?: string;
  specifications?: string;
  dimensions?: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface ProductionFormData {
  order_id: string;
  scheduled_start_date: string;
  scheduled_end_date: string;
  assigned_machine: string;
  assigned_operator_id: string;
  estimated_hours: number;
  notes: string;
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export default function Planning() {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<ProductionFormData>({
    order_id: '',
    scheduled_start_date: '',
    scheduled_end_date: '',
    assigned_machine: '',
    assigned_operator_id: '',
    estimated_hours: 0,
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['approved-orders', searchTerm, priorityFilter],
    queryFn: async () => {
      const params: any = { status: 'approved' };
      if (searchTerm) params.search = searchTerm;
      if (priorityFilter) params.priority = priorityFilter;

      const response = await api.get('/orders', { params });
      return response.data;
    },
  });

  const { data: usersResponse } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
    enabled: isModalOpen,
  });

  const createProductionJobMutation = useMutation({
    mutationFn: async (data: ProductionFormData) => {
      const payload = {
        ...data,
        scheduled_start_date: data.scheduled_start_date ? new Date(data.scheduled_start_date).toISOString() : undefined,
        scheduled_end_date: data.scheduled_end_date ? new Date(data.scheduled_end_date).toISOString() : undefined,
      };
      const response = await api.post('/production/jobs', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approved-orders'] });
      queryClient.invalidateQueries({ queryKey: ['production'] });
      setIsModalOpen(false);
      setSelectedOrder(null);
      setFormData({
        order_id: '',
        scheduled_start_date: '',
        scheduled_end_date: '',
        assigned_machine: '',
        assigned_operator_id: '',
        estimated_hours: 0,
        notes: '',
      });
      toast.success('Production job created successfully');
    },
    onError: () => {
      toast.error('Failed to create production job');
    },
  });

  const handleCreateJob = (order: Order) => {
    setSelectedOrder(order);
    setFormData({
      ...formData,
      order_id: order.id,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProductionJobMutation.mutate(formData);
  };

  const orders: Order[] = response?.data || [];

  const { sortedItems, sortConfig, toggleSort } = useSorting(orders, 'order_date');

  return (
    <div className="space-y-6">
      {/* Search, Priority Tabs & Sort - Single Row */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex-1 min-w-64">
            <Input
              placeholder="Search by order #, customer, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['', 'low', 'normal', 'high', 'urgent'].map((priority) => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priority)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  priorityFilter === priority
                    ? priority === ''
                      ? 'bg-gray-900 text-white'
                      : priorityColors[priority]
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {priority === '' ? 'All' : priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <SortButton
              label="Latest"
              isActive={sortConfig.key === 'order_date'}
              sortOrder={sortConfig.order}
              onClick={() => toggleSort('order_date')}
            />
            <SortButton
              label="Delivery"
              isActive={sortConfig.key === 'delivery_date'}
              sortOrder={sortConfig.order}
              onClick={() => toggleSort('delivery_date')}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : error ? (
        <EmptyState
          icon="AlertCircle"
          title="Error loading approved orders"
          description="There was an error loading the orders. Please try again."
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="Package"
          title="No approved orders found"
          description="Approve orders from the Orders page to see them here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedItems.map((order) => (
            <Card key={order.id} variant="elevated" className="hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{order.order_number}</h3>
                    <p className="text-sm text-gray-600">{order.customer?.name || 'Unknown Customer'}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${priorityColors[order.priority]}`}>
                    {order.priority}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-gray-700"><span className="font-medium">Product:</span> {order.product_name}</p>
                  {order.dimensions && (
                    <p className="text-gray-600"><span className="font-medium">Size:</span> {order.dimensions}</p>
                  )}
                  <p className="text-gray-600"><span className="font-medium">Qty:</span> {order.quantity} {order.unit}</p>
                  <p className="text-gray-600"><span className="font-medium">Delivery:</span> {new Date(order.delivery_date).toLocaleDateString()}</p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => handleCreateJob(order)}
                  disabled={createProductionJobMutation.isPending}
                >
                  Create Job
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
          title="Create Production Job"
          size="md"
        >
          {selectedOrder && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Order: {selectedOrder.order_number}</div>
              <div className="text-sm text-gray-600">Product: {selectedOrder.product_name}</div>
              <div className="text-sm text-gray-600">Quantity: {selectedOrder.quantity} {selectedOrder.unit}</div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={formData.scheduled_start_date}
                onChange={(e) => setFormData({ ...formData, scheduled_start_date: e.target.value })}
              />
              <Input
                label="End Date"
                type="date"
                value={formData.scheduled_end_date}
                onChange={(e) => setFormData({ ...formData, scheduled_end_date: e.target.value })}
              />
              <Input
                label="Assigned Machine"
                value={formData.assigned_machine}
                onChange={(e) => setFormData({ ...formData, assigned_machine: e.target.value })}
                placeholder="e.g., HB1, HB2, UV#1, Dye 1"
              />
              <Select
                label="Assigned Operator"
                options={[
                  { value: '', label: 'Select Operator' },
                  ...(usersResponse?.users?.filter((user: User) => user && user.id).map((user: User) => ({
                    value: user.id,
                    label: user.full_name,
                  })) || []),
                ]}
                value={formData.assigned_operator_id}
                onChange={(e) => setFormData({ ...formData, assigned_operator_id: e.target.value })}
              />
              <Input
                label="Estimated Hours"
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: Number(e.target.value) })}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes or instructions..."
                />
              </div>
            </div>

            {createProductionJobMutation.isError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                Error creating production job
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedOrder(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={createProductionJobMutation.isPending}
              >
                {createProductionJobMutation.isPending ? 'Creating...' : 'Create Job'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
