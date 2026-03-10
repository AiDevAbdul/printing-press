import { Truck, Calendar, MapPin, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export interface DispatchGridProps {
  deliveries: any[];
  isLoading?: boolean;
  onViewDelivery?: (deliveryId: string) => void;
  onUpdateStatus?: (deliveryId: string, status: string) => void;
}

export function DispatchGrid({
  deliveries,
  isLoading = false,
  onViewDelivery,
  onUpdateStatus,
}: DispatchGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <EmptyState
        icon={<Truck />}
        title="No deliveries found"
        description="Schedule your first delivery to get started"
      />
    );
  }

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, any> = {
      pending: 'pending',
      packed: 'in_progress',
      dispatched: 'in_progress',
      in_transit: 'in_progress',
      delivered: 'completed',
      failed: 'cancelled',
      returned: 'cancelled',
    };
    return statusMap[status] || 'pending';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {deliveries.map((delivery) => (
        <Card
          key={delivery.id}
          variant="elevated"
          padding="md"
          hover
          onClick={() => onViewDelivery?.(delivery.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">
                  {delivery.delivery_number}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {delivery.customer.company_name}
                </p>
              </div>
              <Badge variant="status" status={getStatusColor(delivery.delivery_status)}>
                {delivery.delivery_status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-900">
              <Package className="w-4 h-4 text-gray-500" />
              <span>Job #{delivery.job.job_number}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-900">
              <Truck className="w-4 h-4 text-gray-500" />
              <span>{delivery.delivery_type.replace('_', ' ')}</span>
            </div>

            {delivery.courier_name && (
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{delivery.courier_name}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>
                Scheduled: {new Date(delivery.scheduled_date).toLocaleDateString()}
              </span>
            </div>

            {delivery.actual_delivery_date && (
              <div className="text-sm text-green-600 font-medium">
                Delivered: {new Date(delivery.actual_delivery_date).toLocaleDateString()}
              </div>
            )}

            <div className="flex gap-2 pt-3">
              {delivery.delivery_status === 'pending' && (
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus?.(delivery.id, 'dispatched');
                  }}
                >
                  Dispatch
                </Button>
              )}
              {delivery.delivery_status === 'dispatched' && (
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus?.(delivery.id, 'delivered');
                  }}
                >
                  Mark Delivered
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDelivery?.(delivery.id);
                }}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
