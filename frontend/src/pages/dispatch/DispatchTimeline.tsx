import { CheckCircle, Circle, Clock, Truck, Package, MapPin } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export interface DispatchTimelineProps {
  deliveries: any[];
  isLoading?: boolean;
}

export function DispatchTimeline({
  deliveries,
  isLoading = false,
}: DispatchTimelineProps) {
  if (isLoading) {
    return <div className="text-center py-8">Loading timeline...</div>;
  }

  const getStatusIcon = (status: string) => {
    if (status === 'delivered') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (status === 'dispatched' || status === 'in_transit') {
      return <Truck className="w-5 h-5 text-blue-600" />;
    }
    if (status === 'packed') {
      return <Package className="w-5 h-5 text-indigo-600" />;
    }
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

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

  // Sort deliveries by scheduled date
  const sortedDeliveries = [...deliveries].sort(
    (a, b) =>
      new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedDeliveries.map((delivery, index) => (
        <div key={delivery.id} className="relative">
          {/* Timeline Line */}
          {index < sortedDeliveries.length - 1 && (
            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
          )}

          <Card variant="outlined" padding="md" hover>
            <CardContent>
              <div className="flex gap-4">
                {/* Timeline Icon */}
                <div className="flex-shrink-0 relative z-10 bg-white">
                  {getStatusIcon(delivery.delivery_status)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {delivery.delivery_number}
                        </h3>
                        <Badge
                          variant="status"
                          status={getStatusColor(delivery.delivery_status)}
                        >
                          {delivery.delivery_status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {delivery.customer.company_name}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(delivery.scheduled_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Job</p>
                      <p className="font-medium text-gray-900">
                        #{delivery.job.job_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="font-medium text-gray-900">
                        {delivery.delivery_type.replace('_', ' ')}
                      </p>
                    </div>
                    {delivery.courier_name && (
                      <div>
                        <p className="text-xs text-gray-500">Courier</p>
                        <p className="font-medium text-gray-900">
                          {delivery.courier_name}
                        </p>
                      </div>
                    )}
                  </div>

                  {delivery.tracking_number && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        Tracking: {delivery.tracking_number}
                      </span>
                    </div>
                  )}

                  {delivery.actual_delivery_date && (
                    <div className="mt-2 text-sm text-green-600 font-medium">
                      ✓ Delivered on{' '}
                      {new Date(delivery.actual_delivery_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
