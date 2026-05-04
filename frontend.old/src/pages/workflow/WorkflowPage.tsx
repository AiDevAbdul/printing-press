import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import workflowService, { WorkflowResponse } from '../../services/workflow.service';
import { TimelineDetail } from '../../components/workflow/TimelineDetail';
import { MiniTimeline } from '../../components/workflow/MiniTimeline';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { MobileWorkflowModal } from '../../components/workflow/MobileWorkflowModal';

interface JobDetails {
  id: string;
  job_number: string;
  order_number: string;
  product_name: string;
  quantity: number;
  assigned_operator_id?: string;
  operator_name?: string;
  assigned_machine?: string;
  status: string;
  current_stage?: string;
}

export default function WorkflowPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await api.get(`/production/jobs/${jobId}`);
        setJobDetails(response.data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load job details');
        navigate('/production');
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId, navigate]);

  // Fetch workflow with auto-refresh
  const { data: workflow, isLoading, refetch } = useQuery<WorkflowResponse>({
    queryKey: ['workflow', jobId],
    queryFn: () => workflowService.getWorkflowStages(jobId!),
    enabled: !!jobId,
    staleTime: 0, // Always consider data stale so refetch works immediately
    refetchInterval: 2000, // Auto-refresh every 2 seconds for faster updates
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const handleBack = () => {
    navigate('/production');
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading || !jobDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-6 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition"
          >
            ← Back to Production
          </button>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600">No workflow found for this job</p>
          </div>
        </div>
      </div>
    );
  }

  // Mobile view - use full-screen modal
  if (isMobile) {
    return (
      <MobileWorkflowModal
        jobId={jobId!}
        operatorId={jobDetails.assigned_operator_id}
        operatorName={jobDetails.operator_name}
        machine={jobDetails.assigned_machine}
        onClose={handleBack}
        allJobIds={[jobId!]}
        currentIndex={0}
        onNavigate={() => {}}
      />
    );
  }

  // Desktop view - full page layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to Production</span>
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Job Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Job Number</p>
              <p className="text-lg font-semibold text-gray-900">{jobDetails.job_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="text-lg font-semibold text-gray-900">{jobDetails.order_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Product</p>
              <p className="text-lg font-semibold text-gray-900">{jobDetails.product_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quantity</p>
              <p className="text-lg font-semibold text-gray-900">{jobDetails.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Operator</p>
              <p className="text-lg font-semibold text-gray-900">{jobDetails.operator_name || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Machine</p>
              <p className="text-lg font-semibold text-gray-900">{jobDetails.assigned_machine || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold text-gray-900">{jobDetails.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Stage</p>
              <p className="text-lg font-semibold text-gray-900">{jobDetails.current_stage || 'Not started'}</p>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Workflow Progress</h2>
          <MiniTimeline
            stages={workflow.stages}
            compact={false}
            showLabels={true}
          />
        </div>

        {/* Timeline Detail */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Stage Details</h2>
          <TimelineDetail
            jobId={jobId!}
            stages={workflow.stages}
            operatorId={jobDetails.assigned_operator_id}
            operatorName={jobDetails.operator_name}
            machine={jobDetails.assigned_machine}
            onClose={handleBack}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Auto-refresh indicator */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Auto-refreshing every 2 seconds
        </div>
      </div>
    </div>
  );
}
