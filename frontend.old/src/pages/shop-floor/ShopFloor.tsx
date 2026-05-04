import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { shopFloorService } from '../../services/shop-floor.service';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { SortButton } from '../../components/ui/SortButton';
import { useSorting } from '../../hooks/useSorting';
import api from '../../services/api';

const ShopFloor = () => {
  const [showAllJobs, setShowAllJobs] = useState(false);

  const { data: myJobs, isLoading: myJobsLoading, error: myJobsError } = useQuery({
    queryKey: ['my-active-jobs'],
    queryFn: shopFloorService.getMyActiveJobs,
    refetchInterval: 10000,
    enabled: !showAllJobs,
  });

  const { data: allJobsResponse, isLoading: allJobsLoading, error: allJobsError } = useQuery({
    queryKey: ['all-active-jobs'],
    queryFn: async () => {
      const response = await api.get('/production/jobs', {
        params: { status: 'in_progress,queued,paused' }
      });
      return response.data;
    },
    refetchInterval: 10000,
    enabled: showAllJobs,
  });

  const jobs = showAllJobs ? (allJobsResponse?.data || []) : (myJobs || []);
  const isLoading = showAllJobs ? allJobsLoading : myJobsLoading;
  const error = showAllJobs ? allJobsError : myJobsError;

  const { sortedItems, sortConfig, toggleSort } = useSorting(jobs, 'scheduled_start_date');

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      queued: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      paused: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Sort Buttons */}
      <div className="flex gap-2">
        <SortButton
          label="Latest"
          isActive={sortConfig.key === 'scheduled_start_date'}
          sortOrder={sortConfig.order}
          onClick={() => toggleSort('scheduled_start_date')}
        />
        <SortButton
          label="Status"
          isActive={sortConfig.key === 'status'}
          sortOrder={sortConfig.order}
          onClick={() => toggleSort('status')}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : error ? (
        <EmptyState
          icon="AlertCircle"
          title="Error loading jobs"
          description={error instanceof Error ? error.message : 'Unknown error occurred'}
          action={{
            label: `Try ${showAllJobs ? 'My Jobs' : 'All Jobs'}`,
            onClick: () => setShowAllJobs(!showAllJobs),
          }}
        />
      ) : !jobs || jobs.length === 0 ? (
        <EmptyState
          icon="Package"
          title={showAllJobs ? 'No active jobs found' : 'No active jobs assigned to you'}
          description={showAllJobs
            ? 'Create production jobs from the Planning page to see them here.'
            : 'Jobs must be assigned to you and have status "queued" or "in progress".'}
          action={{
            label: showAllJobs ? 'Show My Jobs' : 'Show All Jobs',
            onClick: () => setShowAllJobs(!showAllJobs),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedItems.map((job: any) => (
            <Card key={job.id} variant="elevated" className="hover:shadow-lg transition-shadow h-full">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{job.job_number}</h3>
                      <p className="text-sm text-gray-600">{job.order.product_name}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(job.status)}`}>
                      {job.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700"><span className="font-medium">Customer:</span> {job.order.customer.company_name || job.order.customer.name}</p>
                    <p className="text-gray-600"><span className="font-medium">Order:</span> {job.order.order_number}</p>
                    {job.current_stage && (
                      <p className="text-gray-600"><span className="font-medium">Stage:</span> {job.current_stage}</p>
                    )}
                    {job.assigned_machine && (
                      <p className="text-gray-600"><span className="font-medium">Machine:</span> {job.assigned_machine}</p>
                    )}
                    {job.assigned_operator && (
                      <p className="text-gray-600"><span className="font-medium">Operator:</span> {job.assigned_operator.full_name}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium text-blue-600">{job.inline_status || 'Ready to start'}</p>
                  </div>
                </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopFloor;
