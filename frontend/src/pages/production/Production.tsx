import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ProductionWorkflow from '../../components/ProductionWorkflow';
import { ExpandableJobRow } from '../../components/workflow/ExpandableJobRow';
import { MobileWorkflowModal } from '../../components/workflow/MobileWorkflowModal';
import { useIsDesktop, useIsMobile } from '../../hooks/useMediaQuery';

interface ProductionJob {
  id: string;
  job_number: string;
  order: {
    order_number: string;
    product_name: string;
    quantity?: number;
    customer: {
      name: string;
    };
  };
  scheduled_start_date: string;
  scheduled_end_date: string;
  status: string;
  assigned_machine: string;
  assigned_operator: {
    id: string;
    full_name: string;
  };
  estimated_hours: number;
  actual_hours: number;
  queue_position?: number;
  current_stage?: string;
  current_process?: string;
  inline_status?: string;
  progress_percent?: number;
  notes?: string;
}

interface Order {
  id: string;
  order_number: string;
  product_name: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface ProductionFormData {
  order_id: string;
  scheduled_start_date: string;
  scheduled_end_date: string;
  assigned_machine: string;
  assigned_operator_id: string;
  estimated_hours: number;
  notes: string;
}

const statusColors: Record<string, string> = {
  queued: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Production() {
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [formData, setFormData] = useState<ProductionFormData>({
    order_id: '',
    scheduled_start_date: '',
    scheduled_end_date: '',
    assigned_machine: '',
    assigned_operator_id: '',
    estimated_hours: 0,
    notes: '',
  });

  const queryClient = useQueryClient();
  const isDesktop = useIsDesktop();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['production', statusFilter],
    queryFn: async () => {
      const response = await api.get('/production/jobs', {
        params: statusFilter ? { status: statusFilter } : {},
      });
      return response.data;
    },
  });

  const { data: ordersResponse } = useQuery({
    queryKey: ['orders-for-production'],
    queryFn: async () => {
      const response = await api.get('/orders');
      return response.data;
    },
    enabled: isModalOpen,
  });

  const { data: usersResponse } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
    enabled: isModalOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductionFormData) => {
      // Convert date strings to ISO format for backend
      const payload = {
        ...data,
        scheduled_start_date: data.scheduled_start_date ? new Date(data.scheduled_start_date).toISOString() : undefined,
        scheduled_end_date: data.scheduled_end_date ? new Date(data.scheduled_end_date).toISOString() : undefined,
      };
      const response = await api.post('/production/jobs', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production'] });
      setIsModalOpen(false);
      setFormData({
        order_id: '',
        scheduled_start_date: '',
        scheduled_end_date: '',
        assigned_machine: '',
        assigned_operator_id: '',
        estimated_hours: 0,
        notes: '',
      });
      toast.success('Production job created successfully');
    },
    onError: () => {
      toast.error('Failed to create production job');
    },
  });

  // Note: Job-level mutations commented out as workflow is now managed at stage level
  // Uncomment if needed for mobile fallback or additional job actions
  /*
  const startJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.post(`/production/jobs/${jobId}/start`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production'] });
      toast.success('Job started successfully');
    },
    onError: () => {
      toast.error('Failed to start job');
    },
  });

  const completeJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.post(`/production/jobs/${jobId}/complete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production'] });
      toast.success('Job completed successfully');
    },
    onError: () => {
      toast.error('Failed to complete job');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: string }) => {
      const response = await api.patch(`/production/jobs/${jobId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production'] });
      toast.success('Job status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update job status');
    },
  });
  */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          Error loading production jobs
        </div>
      </div>
    );
  }

  const jobs: ProductionJob[] = response?.data || [];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production</h1>
          <p className="mt-2 text-gray-600">Track production jobs and schedules</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          Add Production Job
        </button>
      </div>

      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="queued">Queued</option>
          <option value="in_progress">In Progress</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {isDesktop && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-8"></th>}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operator</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
                {isDesktop && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workflow</th>}
                {!isDesktop && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={isDesktop ? 9 : 8} className="px-6 py-4 text-center text-gray-500">
                    No production jobs found
                  </td>
                </tr>
              ) : isDesktop ? (
                jobs.map((job) => (
                  <ExpandableJobRow
                    key={job.id}
                    job={{
                      ...job,
                      product_name: job.order.product_name,
                      quantity: job.order.quantity || 0,
                      operator_name: job.assigned_operator?.full_name,
                      operator_id: job.assigned_operator?.id,
                      machine: job.assigned_machine,
                    }}
                    isExpanded={false}
                    onToggle={() => {}}
                  />
                ))
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{job.job_number}</td>
                    <td className="px-4 py-3 text-sm">{job.order.order_number}</td>
                    <td className="px-4 py-3 text-sm">{job.order.product_name}</td>
                    <td className="px-4 py-3 text-sm">{job.order.quantity || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{job.assigned_operator?.full_name || '-'}</td>
                    <td className="px-4 py-3 text-sm">{job.assigned_machine || '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/workflow/${job.id}`)}
                        className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                      >
                        Workflow
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Production Job</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order *</label>
                  <select
                    required
                    value={formData.order_id}
                    onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Order</option>
                    {ordersResponse?.data?.map((order: Order) => (
                      <option key={order.id} value={order.id}>
                        {order.order_number} - {order.product_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.scheduled_start_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.scheduled_end_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Machine</label>
                  <input
                    type="text"
                    placeholder="e.g., HB1, HB2, UV#1, Dye 1"
                    value={formData.assigned_machine}
                    onChange={(e) => setFormData({ ...formData, assigned_machine: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Operator</label>
                  <select
                    value={formData.assigned_operator_id}
                    onChange={(e) => setFormData({ ...formData, assigned_operator_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Operator</option>
                    {usersResponse?.map((user: User) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes or instructions..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Job'}
                </button>
              </div>
              {createMutation.isError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  Error creating production job
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {showWorkflowModal && selectedJobId && (() => {
        const selectedJob = jobs?.find((job: ProductionJob) => job.id === selectedJobId);
        const currentIndex = jobs.findIndex((job: ProductionJob) => job.id === selectedJobId);
        const allJobIds = jobs.map((job: ProductionJob) => job.id);

        return isMobile ? (
          <MobileWorkflowModal
            jobId={selectedJobId}
            operatorId={selectedJob?.assigned_operator?.id}
            operatorName={selectedJob?.assigned_operator?.full_name}
            machine={selectedJob?.assigned_machine}
            onClose={() => {
              setShowWorkflowModal(false);
              setSelectedJobId(null);
            }}
            allJobIds={allJobIds}
            currentIndex={currentIndex}
            onNavigate={(index) => {
              setSelectedJobId(allJobIds[index]);
            }}
          />
        ) : (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Job #{selectedJob?.job_number}</h2>
                <button
                  onClick={() => {
                    setShowWorkflowModal(false);
                    setSelectedJobId(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <ProductionWorkflow
                jobId={selectedJobId}
                operatorName={selectedJob?.assigned_operator?.full_name}
                machine={selectedJob?.assigned_machine}
                operatorId={selectedJob?.assigned_operator?.id}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
}
