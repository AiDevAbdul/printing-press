import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { shopFloorService, ProductionJob } from '../../services/shop-floor.service';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ShopFloor = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAllJobs, setShowAllJobs] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  // Debug logging
  console.log('Shop Floor Debug:', {
    showAllJobs,
    isLoading,
    error,
    jobs,
    myJobs,
    allJobsResponse
  });

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
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Shop Floor</h1>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-gray-600">{showAllJobs ? 'All Active Jobs' : 'My Active Jobs'}</p>
          <button
            onClick={() => setShowAllJobs(!showAllJobs)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showAllJobs ? 'Show My Jobs' : 'Show All Jobs'}
          </button>
        </div>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-semibold">Error loading jobs</p>
          <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <button
            onClick={() => setShowAllJobs(!showAllJobs)}
            className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try {showAllJobs ? 'My Jobs' : 'All Jobs'}
          </button>
        </div>
      ) : !jobs || jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">
            {showAllJobs ? 'No active jobs found' : 'No active jobs assigned to you'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {showAllJobs
              ? 'Create production jobs from the Planning page to see them here.'
              : 'Jobs must be assigned to you and have status "queued" or "in progress".'}
          </p>
          <button
            onClick={() => setShowAllJobs(!showAllJobs)}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showAllJobs ? 'Show My Jobs' : 'Show All Jobs'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job: ProductionJob) => (
            <Link
              key={job.id}
              to={`/shop-floor/job/${job.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{job.job_number}</h3>
                    <p className="text-sm text-gray-600">{job.order.product_name}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                    {job.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{job.order.customer.company_name || job.order.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order:</span>
                    <span className="font-medium">{job.order.order_number}</span>
                  </div>
                  {job.current_stage && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Stage:</span>
                      <span className="font-medium">{job.current_stage}</span>
                    </div>
                  )}
                  {job.assigned_machine && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Machine:</span>
                      <span className="font-medium">{job.assigned_machine}</span>
                    </div>
                  )}
                  {job.assigned_operator && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Operator:</span>
                      <span className="font-medium">{job.assigned_operator.full_name}</span>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-blue-600 font-medium">{job.inline_status || 'Ready to start'}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex justify-around p-4">
          <Link
            to="/shop-floor"
            className="flex flex-col items-center text-blue-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Jobs</span>
          </Link>
          <Link
            to="/shop-floor/scan"
            className="flex flex-col items-center text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span className="text-xs mt-1">Scan QR</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopFloor;
