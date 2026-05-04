import { Plus, Factory } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';

export interface ProductionListProps {
  jobs: any[];
  isLoading?: boolean;
  onCreateJob?: () => void;
  onViewWorkflow?: (jobId: string) => void;
  onPauseJob?: (jobId: string) => void;
  onResumeJob?: (jobId: string) => void;
}

export function ProductionList({
  jobs,
  isLoading = false,
  onCreateJob,
  onViewWorkflow,
  onPauseJob,
  onResumeJob,
}: ProductionListProps) {
  const filteredJobs = jobs;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse bg-gray-200 rounded-lg"></div>
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
    <div className="space-y-2">
      {filteredJobs.map((job) => (
        <Card
          key={job.id}
          variant="outlined"
          padding="md"
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onViewWorkflow?.(job.id)}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium text-gray-900">
                    Job #{job.job_number}
                  </p>
                  <p className="text-sm text-gray-600">
                    Order #{job.order_number} • {job.product_name}
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">Progress</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${job.progress || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-600 w-8">
                    {job.progress || 0}%
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500">Operator</p>
                <p className="text-sm font-medium text-gray-900">
                  {job.operator_name || '-'}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500">Machine</p>
                <p className="text-sm font-medium text-gray-900">
                  {job.machine || '-'}
                </p>
              </div>

              <Badge
                variant="status"
                status={job.status as any}
              >
                {job.status}
              </Badge>
            </div>

            <div className="flex gap-2">
              {job.status === 'in_progress' && (
                <Button
                  variant="ghost"
                  size="sm"
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
                onClick={(e) => {
                  e.stopPropagation();
                  onViewWorkflow?.(job.id);
                }}
              >
                Workflow
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
