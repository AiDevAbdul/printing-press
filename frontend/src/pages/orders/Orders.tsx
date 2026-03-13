import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Grid3x3, Kanban, Menu, X, List } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { SortButton } from '../../components/ui/SortButton';
import OrderFormModal from './OrderFormModal';
import OrderDetailsModal from '../../components/orders/OrderDetailsModal';
import { OrdersGrid } from './OrdersGrid';
import { OrdersKanban } from './OrdersKanban';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    order_date: order.order_date,
  }));

  const { sortedItems, sortConfig, toggleSort } = useSorting(transformedOrders, 'order_date');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Filters */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Search */}
          <div>
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Status</p>
            <div className="space-y-2">
              {['pending', 'approved', 'in_production', 'completed', 'delivered', 'cancelled'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setStatusFilter(status)}
                >
                  {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Product Type Filter */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Product Type</p>
            <div className="space-y-2">
              {['', 'cpp_carton', 'silvo_blister', 'bent_foil', 'alu_alu'].map((type) => (
                <Button
                  key={type}
                  variant={productTypeFilter === type ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setProductTypeFilter(type)}
                >
                  {type === '' ? 'All' : type === 'cpp_carton' ? 'CPP Carton' : type === 'silvo_blister' ? 'Silvo/Blister' : type === 'bent_foil' ? 'Bent Foil' : 'Alu-Alu'}
                </Button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Priority</p>
            <div className="space-y-2">
              {['low', 'normal', 'high', 'urgent'].map((priority) => (
                <Button
                  key={priority}
                  variant={priorityFilter === priority ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setPriorityFilter(priority)}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={sidebarOpen ? 'primary' : 'outline'}
                size="sm"
                icon={sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                Filters
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                icon={<Grid3x3 className="w-4 h-4" />}
                onClick={() => setViewMode('grid')}
              />
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                icon={<List className="w-4 h-4" />}
                onClick={() => setViewMode('list')}
              />
              <Button
                variant={viewMode === 'kanban' ? 'primary' : 'outline'}
                size="sm"
                icon={<Kanban className="w-4 h-4" />}
                onClick={() => setViewMode('kanban')}
              />

              <div className="w-px h-6 bg-gray-200" />

              <SortButton
                label="Latest"
                isActive={sortConfig.key === 'order_date'}
                sortOrder={sortConfig.order}
                onClick={() => toggleSort('order_date')}
              />
              <SortButton
                label="Delivery Date"
                isActive={sortConfig.key === 'delivery_date'}
                sortOrder={sortConfig.order}
                onClick={() => toggleSort('delivery_date')}
              />
              <SortButton
                label="Amount"
                isActive={sortConfig.key === 'amount'}
                sortOrder={sortConfig.order}
                onClick={() => toggleSort('amount')}
              />

              <div className="w-px h-6 bg-gray-200" />

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsModalOpen(true)}
              >
                New Order
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
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
          ) : sortedItems.length === 0 ? (
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
              orders={sortedItems}
              viewMode="grid"
              onCreateOrder={() => setIsModalOpen(true)}
              onViewOrder={handleViewOrder}
              onApproveOrder={handleApproveOrder}
            />
          ) : viewMode === 'list' ? (
            <OrdersGrid
              orders={sortedItems}
              viewMode="list"
              onCreateOrder={() => setIsModalOpen(true)}
              onViewOrder={handleViewOrder}
              onApproveOrder={handleApproveOrder}
            />
          ) : (
            <OrdersKanban
              orders={sortedItems}
              onCreateOrder={() => setIsModalOpen(true)}
              onViewOrder={handleViewOrder}
            />
          )}
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

      {showOrderDetails && selectedOrderId && (() => {
        const order = orders.find((o: any) => o.id === selectedOrderId);
        if (!order) return null;

        return (
          <OrderDetailsModal
            order={order}
            onClose={() => {
              setShowOrderDetails(false);
              setSelectedOrderId(null);
            }}
          />
        );
      })()}
    </div>
  );
}
