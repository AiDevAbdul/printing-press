import { useState } from 'react';
import { GripVertical, Plus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export interface ProductionKanbanProps {
  jobs: any[];
  isLoading?: boolean;
  onCreateJob?: () => void;
  onViewWorkflow?: (jobId: string) => void;
  onStatusChange?: (jobId: string, newStatus: string) => void;
}

const STATUSES = [
  { id: 'queued', label: 'Queued', color: 'warning' },
  { id: 'in_progress', label: 'In Progress', color: 'primary' },
  { id: 'paused', label: 'Paused', color: 'info' },
  { id: 'completed', label: 'Completed', color: 'success' },
  { id: 'cancelled', label: 'Cancelled', color: 'error' },
];

export function ProductionKanban({
  jobs,
  isLoading = false,
  onCreateJob,
  onViewWorkflow,
  onStatusChange,
}: ProductionKanbanProps) {
  const [draggedJob, setDraggedJob] = useState<any>(null);

  const getJobsByStatus = (status: string) => {
    return jobs.filter((job) => job.status === status);
  };

  const handleDragStart = (e: React.DragEvent, job: any) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedJob && draggedJob.status !== newStatus) {
      onStatusChange?.(draggedJob.id, newStatus);
    }
    setDraggedJob(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {STATUSES.map((status) => (
          <div key={status.id} className="bg-gray-100 rounded-lg h-96 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Production Pipeline</h2>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={onCreateJob}
        >
          New Job
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => {
          const statusJobs = getJobsByStatus(status.id);

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
                    {statusJobs.length}
                  </span>
                </div>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status.id)}
                className="bg-gray-50 rounded-lg p-3 min-h-96 border-2 border-dashed border-gray-300 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50"
              >
                {statusJobs.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p className="text-sm">No jobs</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {statusJobs.map((job) => (
                      <Card
                        key={job.id}
                        variant="default"
                        padding="sm"
                        className={`cursor-move transition-all duration-200 ${
                          draggedJob?.id === job.id
                            ? 'opacity-50 scale-95'
                            : 'hover:shadow-md'
                        }`}
                        onDragStart={(e: React.DragEvent) => handleDragStart(e, job)}
                        onClick={() => onViewWorkflow?.(job.id)}
                      >
                        <div className="flex gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              #{job.job_number}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              Order #{job.order_number}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {job.product_name}
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full"
                                  style={{ width: `${job.progress || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium text-gray-600 w-6">
                                {job.progress || 0}%
                              </span>
                            </div>
                            <div className="flex gap-1 mt-2">
                              <Badge variant="default">
                                {job.operator_name || 'Unassigned'}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {job.quantity} {job.unit}
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
