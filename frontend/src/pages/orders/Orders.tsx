import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Grid3x3, Kanban, X } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import OrderFormModal from './OrderFormModal';
import { OrdersGrid } from './OrdersGrid';
import { OrdersKanban } from './OrdersKanban';

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
  varnish_type?: string[];
  varnish_details?: string;

  // Lamination
  lamination_type?: string[];
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

export default function Orders() {
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

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

      // Remove empty arrays for varnish and lamination types
      if (!payload.varnish_type || payload.varnish_type.length === 0) {
        delete payload.varnish_type;
      }
      if (!payload.lamination_type || payload.lamination_type.length === 0) {
        delete payload.lamination_type;
      }

      // Remove empty optional fields
      Object.keys(payload).forEach(key => {
        if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await api.post('/orders', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsModalOpen(false);
      toast.success('Order created successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to create order';
      toast.error(errorMessage);
    },
  });

  const handleFormSubmit = (data: OrderFormData) => {
    createMutation.mutate(data);
  };

  const approveOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.patch(`/orders/${orderId}/status`, { status: 'approved' });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order approved successfully');
    },
    onError: () => {
      toast.error('Failed to approve order');
    },
  });

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowOrderDetails(true);
  };

  const handleApproveOrder = (orderId: string) => {
    approveOrderMutation.mutate(orderId);
  };

  const orders: Order[] = response?.data || [];

  const transformedOrders = orders.map((order: Order) => ({
    id: order.id,
    order_number: order.order_number,
    customer_name: order.customer?.name || '',
    product_name: order.product_name,
    quantity: order.quantity,
    unit: order.unit,
    delivery_date: order.delivery_date,
    amount: order.final_price,
    status: order.status,
    priority: order.priority,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">Manage customer orders and track progress</p>
      </div>

      {/* View Toggle */}
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
            variant={viewMode === 'kanban' ? 'primary' : 'ghost'}
            size="sm"
            icon={<Kanban className="w-4 h-4" />}
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'in_production', label: 'In Production' },
            { value: 'completed', label: 'Completed' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
        <Select
          options={[
            { value: '', label: 'All Product Types' },
            { value: 'cpp_carton', label: 'CPP Carton' },
            { value: 'silvo_blister', label: 'Silvo/Blister' },
            { value: 'bent_foil', label: 'Bent Foil' },
            { value: 'alu_alu', label: 'Alu-Alu' },
          ]}
          value={productTypeFilter}
          onChange={(e) => setProductTypeFilter(e.target.value)}
        />
        <Select
          options={[
            { value: '', label: 'All Priorities' },
            { value: 'low', label: 'Low' },
            { value: 'normal', label: 'Normal' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' },
          ]}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : error ? (
        <EmptyState
          icon="AlertCircle"
          title="Error loading orders"
          description="There was an error loading the orders. Please try again."
        />
      ) : transformedOrders.length === 0 ? (
        <EmptyState
          icon="Package"
          title="No orders found"
          description="Get started by creating your first order."
          action={{
            label: 'Add Order',
            onClick: () => setIsModalOpen(true),
          }}
        />
      ) : viewMode === 'grid' ? (
        <OrdersGrid
          orders={transformedOrders}
          onCreateOrder={() => setIsModalOpen(true)}
          onViewOrder={handleViewOrder}
          onApproveOrder={handleApproveOrder}
        />
      ) : (
        <OrdersKanban
          orders={transformedOrders}
          onCreateOrder={() => setIsModalOpen(true)}
          onViewOrder={handleViewOrder}
        />
      )}

      <OrderFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        customers={customersResponse?.data || []}
        isSubmitting={createMutation.isPending}
        error={createMutation.isError}
      />

      {showOrderDetails && selectedOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold">Order Details</h2>
              <button
                onClick={() => {
                  setShowOrderDetails(false);
                  setSelectedOrderId(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const order = orders.find((o: any) => o.id === selectedOrderId);
                if (!order) return <p>Order not found</p>;

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Order Number</p>
                        <p className="text-lg font-semibold">{order.order_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="text-lg font-semibold capitalize">{order.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="text-lg font-semibold">{order.customer?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Product</p>
                        <p className="text-lg font-semibold">{order.product_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Quantity</p>
                        <p className="text-lg font-semibold">{order.quantity} {order.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Delivery Date</p>
                        <p className="text-lg font-semibold">{new Date(order.delivery_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Priority</p>
                        <p className="text-lg font-semibold capitalize">{order.priority}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="text-lg font-semibold">₹{order.final_price?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
