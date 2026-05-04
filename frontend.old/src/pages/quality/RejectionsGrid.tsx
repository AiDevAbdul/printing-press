import { XCircle, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export interface RejectionsGridProps {
  rejections: any[];
  isLoading?: boolean;
  onViewRejection?: (rejectionId: string) => void;
}

export function RejectionsGrid({
  rejections,
  isLoading = false,
  onViewRejection,
}: RejectionsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (rejections.length === 0) {
    return (
      <EmptyState
        icon={<XCircle />}
        title="No rejections found"
        description="Quality rejections will appear here"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rejections.map((rejection) => (
        <Card
          key={rejection.id}
          variant="elevated"
          padding="md"
          hover
          onClick={() => onViewRejection?.(rejection.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">
                  {rejection.rejection_number}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {rejection.rejected_quantity} {rejection.unit}
                </p>
              </div>
              <Badge
                variant="status"
                status={rejection.is_resolved ? 'completed' : 'pending'}
              >
                {rejection.is_resolved ? 'Resolved' : 'Open'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Disposition</p>
              <Badge variant="default">
                {rejection.disposition.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            {rejection.estimated_loss && (
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <DollarSign className="w-4 h-4 text-red-600" />
                <span className="font-medium">
                  ₹{rejection.estimated_loss.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date(rejection.created_at).toLocaleDateString()}</span>
            </div>

            {rejection.reason && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {rejection.reason}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
