import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';

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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          Error loading approved orders
        </div>
      </div>
    );
  }

  const orders: Order[] = response?.data || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Planning</h1>
        <p className="mt-2 text-gray-600">Create production jobs from approved orders</p>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <button
            onClick={() => {
              setPriorityFilter('');
              setSearchTerm('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by order #, customer, product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type/Strength</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No approved orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{order.customer.name}</div>
                      {order.customer.company_name && (
                        <div className="text-xs text-gray-500">{order.customer.company_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{order.product_name}</div>
                      {order.specifications && (
                        <div className="text-xs text-gray-500 truncate max-w-xs" title={order.specifications}>
                          {order.specifications}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.product_type && (
                        <div className="text-xs font-medium text-gray-700">
                          {order.product_type.replace('_', ' ').toUpperCase()}
                        </div>
                      )}
                      {order.strength && (
                        <div className="text-xs text-gray-500">{order.strength}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.quantity} {order.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.delivery_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColors[order.priority]}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleCreateJob(order)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Create Job
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create Production Job</h2>
            {selectedOrder && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Order: {selectedOrder.order_number}</div>
                <div className="text-sm text-gray-600">Product: {selectedOrder.product_name}</div>
                <div className="text-sm text-gray-600">Quantity: {selectedOrder.quantity} {selectedOrder.unit}</div>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.scheduled_start_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.scheduled_end_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Machine</label>
                  <input
                    type="text"
                    placeholder="e.g., HB1, HB2, UV#1, Dye 1"
                    value={formData.assigned_machine}
                    onChange={(e) => setFormData({ ...formData, assigned_machine: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Operator</label>
                  <select
                    value={formData.assigned_operator_id}
                    onChange={(e) => setFormData({ ...formData, assigned_operator_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Operator</option>
                    {usersResponse?.map((user: User) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes or instructions..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProductionJobMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createProductionJobMutation.isPending ? 'Creating...' : 'Create Job'}
                </button>
              </div>
              {createProductionJobMutation.isError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  Error creating production job
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
