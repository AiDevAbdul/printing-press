import { AlertCircle, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export interface ComplaintsGridProps {
  complaints: any[];
  isLoading?: boolean;
  onViewComplaint?: (complaintId: string) => void;
}

export function ComplaintsGrid({
  complaints,
  isLoading = false,
  onViewComplaint,
}: ComplaintsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <EmptyState
        icon={<AlertCircle />}
        title="No complaints found"
        description="Customer complaints will appear here"
      />
    );
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, any> = {
      critical: 'urgent',
      high: 'high',
      medium: 'medium',
      low: 'low',
    };
    return colors[severity] || 'low';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {complaints.map((complaint) => (
        <Card
          key={complaint.id}
          variant="elevated"
          padding="md"
          hover
          onClick={() => onViewComplaint?.(complaint.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base">
                  {complaint.complaint_number}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {complaint.customer.company_name}
                </p>
              </div>
              <Badge variant="status" status={complaint.status as any}>
                {complaint.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Subject</p>
              <p className="text-sm font-medium text-gray-900 line-clamp-2">
                {complaint.subject}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">Severity:</p>
              <Badge variant="priority" priority={getSeverityColor(complaint.severity)}>
                {complaint.severity}
              </Badge>
            </div>

            {complaint.assigned_to && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{complaint.assigned_to.full_name}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
