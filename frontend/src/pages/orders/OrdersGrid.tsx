import { useState } from 'react';
import { Plus, Filter, Grid, List } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { Package } from 'lucide-react';

export interface OrdersGridProps {
  orders: any[];
  isLoading?: boolean;
  onCreateOrder?: () => void;
  onViewOrder?: (orderId: string) => void;
  onApproveOrder?: (orderId: string) => void;
}

export function OrdersGrid({
  orders,
  isLoading = false,
  onCreateOrder,
  onViewOrder,
  onApproveOrder,
}: OrdersGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-64 animate-pulse bg-gray-200">
            <div></div>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <EmptyState
        icon={<Package />}
        title="No orders found"
        description="Create your first order to get started"
        action={{
          label: 'Create Order',
          onClick: onCreateOrder || (() => {}),
          icon: <Plus className="w-4 h-4" />,
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            icon={<Grid className="w-4 h-4" />}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            icon={<List className="w-4 h-4" />}
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={onCreateOrder}
        >
          New Order
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          placeholder="Search by order #, customer, or product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Filter className="w-4 h-4" />}
        />
        <Select
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
        <Select
          options={[
            { value: 'all', label: 'All Priority' },
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' },
          ]}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        />
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              variant="elevated"
              padding="md"
              hover
              onClick={() => onViewOrder?.(order.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Order #{order.order_number}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.customer_name}
                    </p>
                  </div>
                  <Badge
                    variant="status"
                    status={order.status as any}
                  >
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Product</p>
                  <p className="text-sm font-medium text-gray-900">
                    {order.product_name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="text-sm font-medium text-gray-900">
                      {order.quantity} {order.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Delivery</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(order.delivery_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-sm font-medium text-gray-900">
                      ₹{order.amount?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Priority</p>
                    <Badge variant="priority" priority={order.priority as any}>
                      {order.priority}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  {order.status === 'pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        onApproveOrder?.(order.id);
                      }}
                    >
                      Approve
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewOrder?.(order.id);
                    }}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              variant="outlined"
              padding="md"
              hover
              onClick={() => onViewOrder?.(order.id)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        Order #{order.order_number}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.customer_name} • {order.product_name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {order.quantity} {order.unit}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.delivery_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ₹{order.amount?.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="status" status={order.status as any}>
                    {order.status}
                  </Badge>
                  <Badge variant="priority" priority={order.priority as any}>
                    {order.priority}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApproveOrder?.(order.id);
                      }}
                    >
                      Approve
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewOrder?.(order.id);
                    }}
                  >
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
