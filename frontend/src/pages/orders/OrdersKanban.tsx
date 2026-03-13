import { useState } from 'react';
import { GripVertical } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';

export interface OrdersKanbanProps {
  orders: any[];
  isLoading?: boolean;
  onCreateOrder?: () => void;
  onViewOrder?: (orderId: string) => void;
  onStatusChange?: (orderId: string, newStatus: string) => void;
}

const STATUSES = [
  { id: 'pending', label: 'Pending', color: 'warning' },
  { id: 'approved', label: 'Approved', color: 'info' },
  { id: 'in_progress', label: 'In Progress', color: 'primary' },
  { id: 'completed', label: 'Completed', color: 'success' },
  { id: 'delivered', label: 'Delivered', color: 'success' },
  { id: 'cancelled', label: 'Cancelled', color: 'error' },
];

export function OrdersKanban({
  orders,
  isLoading = false,
  onCreateOrder,
  onViewOrder,
  onStatusChange,
}: OrdersKanbanProps) {
  const [draggedOrder, setDraggedOrder] = useState<any>(null);

  const getOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.status === status);
  };

  const handleDragStart = (e: React.DragEvent, order: any) => {
    setDraggedOrder(order);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedOrder && draggedOrder.status !== newStatus) {
      onStatusChange?.(draggedOrder.id, newStatus);
    }
    setDraggedOrder(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {STATUSES.map((status) => (
          <div key={status.id} className="bg-gray-100 rounded-lg h-96 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => {
          const statusOrders = getOrdersByStatus(status.id);

          return (
            <div
              key={status.id}
              className="flex-shrink-0 w-full md:w-80 lg:w-72"
            >
              {/* Column Header */}
              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{status.label}</h3>
                  <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                    {statusOrders.length}
                  </span>
                </div>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status.id)}
                className="bg-gray-50 rounded-lg p-3 min-h-96 border-2 border-dashed border-gray-300 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50"
              >
                {statusOrders.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p className="text-sm">No orders</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {statusOrders.map((order) => (
                      <Card
                        key={order.id}
                        variant="default"
                        padding="sm"
                        className={`cursor-move transition-all duration-200 ${
                          draggedOrder?.id === order.id
                            ? 'opacity-50 scale-95'
                            : 'hover:shadow-md'
                        }`}
                        onDragStart={(e: React.DragEvent) => handleDragStart(e, order)}
                        onClick={() => onViewOrder?.(order.id)}
                      >
                        <div className="flex gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              #{order.order_number}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {order.customer_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {order.product_name}
                            </p>
                            <div className="flex gap-1 mt-2">
                              <Badge
                                variant="priority"
                                priority={order.priority as any}
                              >
                                {order.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                              ₹{order.amount?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
