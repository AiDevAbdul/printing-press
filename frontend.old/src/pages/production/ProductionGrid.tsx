import { Plus, Factory } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';

export interface ProductionGridProps {
  jobs: any[];
  isLoading?: boolean;
  onCreateJob?: () => void;
  onViewWorkflow?: (jobId: string) => void;
  onPauseJob?: (jobId: string) => void;
  onResumeJob?: (jobId: string) => void;
}

export function ProductionGrid({
  jobs,
  isLoading = false,
  onCreateJob,
  onViewWorkflow,
  onPauseJob,
  onResumeJob,
}: ProductionGridProps) {
  const filteredJobs = jobs;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-72 animate-pulse bg-gray-200">
            <div></div>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredJobs.length === 0) {
    return (
      <EmptyState
        icon={<Factory />}
        title="No production jobs found"
        description="Create your first production job to get started"
        action={{
          label: 'Create Job',
          onClick: onCreateJob || (() => {}),
          icon: <Plus className="w-4 h-4" />,
        }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredJobs.map((job) => (
        <Card
          key={job.id}
          variant="elevated"
          padding="md"
          hover
          onClick={() => onViewWorkflow?.(job.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">
                  Job #{job.job_number}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Order #{job.order_number}
                </p>
              </div>
              <Badge
                variant="status"
                status={job.status as any}
              >
                {job.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Product</p>
              <p className="text-sm font-medium text-gray-900">
                {job.product_name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Quantity</p>
                <p className="text-sm font-medium text-gray-900">
                  {job.quantity} {job.unit}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Progress</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${job.progress || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {job.progress || 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Operator</p>
                <p className="text-sm font-medium text-gray-900">
                  {job.operator_name || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Machine</p>
                <p className="text-sm font-medium text-gray-900">
                  {job.machine || '-'}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              {job.status === 'in_progress' && (
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    onPauseJob?.(job.id);
                  }}
                >
                  Pause
                </Button>
              )}
              {job.status === 'paused' && (
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    onResumeJob?.(job.id);
                  }}
                >
                  Resume
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  onViewWorkflow?.(job.id);
                }}
              >
                Workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
