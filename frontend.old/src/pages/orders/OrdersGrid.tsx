import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Package } from 'lucide-react';

export interface OrdersGridProps {
  orders: any[];
  viewMode?: 'grid' | 'list';
  isLoading?: boolean;
  onCreateOrder?: () => void;
  onViewOrder?: (orderId: string) => void;
  onApproveOrder?: (orderId: string) => void;
}

export function OrdersGrid({
  orders,
  viewMode = 'grid',
  isLoading = false,
  onCreateOrder,
  onViewOrder,
  onApproveOrder,
}: OrdersGridProps) {
  // Filter orders
  const filteredOrders = orders;

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
