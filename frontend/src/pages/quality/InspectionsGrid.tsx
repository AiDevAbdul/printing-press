import { ClipboardCheck, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export interface InspectionsGridProps {
  inspections: any[];
  isLoading?: boolean;
  onViewInspection?: (inspectionId: string) => void;
}

export function InspectionsGrid({
  inspections,
  isLoading = false,
  onViewInspection,
}: InspectionsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (inspections.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardCheck />}
        title="No inspections found"
        description="Start by creating your first quality inspection"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {inspections.map((inspection) => (
        <Card
          key={inspection.id}
          variant="elevated"
          padding="md"
          hover
          onClick={() => onViewInspection?.(inspection.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">
                  {inspection.inspection_number}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {inspection.checkpoint.name}
                </p>
              </div>
              <Badge variant="status" status={inspection.status as any}>
                {inspection.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Sample Size</p>
                <p className="text-sm font-medium text-gray-900">
                  {inspection.sample_size || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Defects Found</p>
                <p className="text-sm font-medium text-gray-900">
                  {inspection.defects_found || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{inspection.inspector.full_name}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date(inspection.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
