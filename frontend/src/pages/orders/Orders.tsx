import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import OrderFormModal from './OrderFormModal';

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
  group_name?: string;
  product_type?: string;
  strength?: string;
  batch_number?: string;
  specifications?: string;
  production_status?: string;
}

interface OrderFormData {
  customer_id: string;
  order_date: string;
  product_name: string;
  quantity: number;
  unit: string;
  delivery_date: string;
  priority: string;
  final_price: number;
  special_instructions: string;

  // Product Type
  product_type?: string;
  is_repeat_order?: boolean;
  previous_order_id?: string;

  // Enhanced Order Tracking (Part 4)
  group_name?: string;
  strength?: string;
  batch_number?: string;
  specifications?: string;
  production_status?: string;
  auto_sync_enabled?: boolean;

  // Detailed Specifications
  card_size?: string;
  type?: string;

  // Color Details
  color_cmyk?: string;
  color_p1?: string;
  color_p2?: string;
  color_p3?: string;
  color_p4?: string;

  // Varnish
  varnish_type?: string;
  varnish_details?: string;

  // Lamination
  lamination_type?: string;
  lamination_size?: string;

  // Embossing & Finishing
  uv_emboss_details?: string;
  has_back_printing?: boolean;
  has_barcode?: boolean;

  // Pre-Press
  ctp_info?: string;
  die_type?: string;
  die_reference?: string;
  emboss_film_details?: string;
  plate_reference?: string;

  // Design Tracking
  designer_name?: string;

  // Silvo/Blister Foil
  cylinder_reference?: string;
  cylinder_sent_date?: string;
  cylinder_approved_date?: string;
  cylinder_received_date?: string;

  // Bent Foil / Alu-Alu
  thickness_micron?: number;
  tablet_size?: string;
  punch_size?: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  in_production: 'bg-orange-600 text-white',
  completed: 'bg-green-100 text-green-800',
  delivered: 'bg-green-600 text-white',
  cancelled: 'bg-red-100 text-red-800',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['orders', statusFilter, searchTerm, productTypeFilter, priorityFilter],
    queryFn: async () => {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      if (productTypeFilter) params.productType = productTypeFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const response = await api.get('/orders', { params });
      return response.data;
    },
  });

  const { data: customersResponse } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await api.get('/customers');
      return response.data;
    },
    enabled: isModalOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      // Convert date strings to ISO format for backend
      const payload: any = {
        ...data,
        order_date: new Date(data.order_date).toISOString(),
        delivery_date: new Date(data.delivery_date).toISOString(),
      };

      // Convert cylinder dates if present
      if (data.cylinder_sent_date) {
        payload.cylinder_sent_date = new Date(data.cylinder_sent_date).toISOString();
      }
      if (data.cylinder_approved_date) {
        payload.cylinder_approved_date = new Date(data.cylinder_approved_date).toISOString();
      }
      if (data.cylinder_received_date) {
        payload.cylinder_received_date = new Date(data.cylinder_received_date).toISOString();
      }

      const response = await api.post('/orders', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsModalOpen(false);
    },
  });

  const handleFormSubmit = (data: OrderFormData) => {
    createMutation.mutate(data);
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
          Error loading orders
        </div>
      </div>
    );
  }

  const orders: Order[] = response?.data || [];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-2 text-gray-600">Manage customer orders and track progress</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          Add Order
        </button>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="in_production">In Production</option>
            <option value="completed">Completed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={productTypeFilter}
            onChange={(e) => setProductTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Product Types</option>
            <option value="cpp_carton">CPP Carton</option>
            <option value="silvo_blister">Silvo/Blister</option>
            <option value="bent_foil">Bent Foil</option>
            <option value="alu_alu">Alu-Alu</option>
          </select>

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
              setStatusFilter('');
              setProductTypeFilter('');
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
          placeholder="Search by order #, customer, product, group, batch #..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                      {order.batch_number && (
                        <div className="text-xs text-gray-500">Batch: {order.batch_number}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{order.customer.name}</div>
                      {order.customer.company_name && (
                        <div className="text-xs text-gray-500">{order.customer.company_name}</div>
                      )}
                      {order.group_name && (
                        <div className="text-xs text-gray-500">Group: {order.group_name}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                      {order.production_status && (
                        <div className="text-xs text-gray-500 mt-1">{order.production_status}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.final_price ? `₹${order.final_price.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        customers={customersResponse?.data || []}
        isSubmitting={createMutation.isPending}
        error={createMutation.isError}
      />
    </div>
  );
}
