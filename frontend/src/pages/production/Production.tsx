import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Grid3x3, Kanban } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProductionGrid } from './ProductionGrid';
import { ProductionKanban } from './ProductionKanban';

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

export default function Production() {
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
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

  const jobs: ProductionJob[] = response?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production</h1>
          <p className="text-gray-600 mt-1">Track production jobs and schedules</p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Production Job
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            icon={<Grid3x3 className="w-4 h-4" />}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'primary' : 'ghost'}
            size="sm"
            icon={<Kanban className="w-4 h-4" />}
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </Button>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="queued">Queued</option>
          <option value="in_progress">In Progress</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : error ? (
        <EmptyState
          icon="AlertCircle"
          title="Error loading production jobs"
          description="There was an error loading the production jobs. Please try again."
        />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="Factory"
          title="No production jobs found"
          description="Get started by creating your first production job."
          action={{
            label: 'Add Production Job',
            onClick: () => setIsModalOpen(true),
          }}
        />
      ) : viewMode === 'grid' ? (
        <ProductionGrid jobs={jobs} />
      ) : (
        <ProductionKanban jobs={jobs} />
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Production Job"
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Select
                  label="Order *"
                  options={[
                    { value: '', label: 'Select Order' },
                    ...(ordersResponse?.data?.map((order: Order) => ({
                      value: order.id,
                      label: `${order.order_number} - ${order.product_name}`,
                    })) || []),
                  ]}
                  value={formData.order_id}
                  onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                />
              </div>
              <Input
                label="Start Date"
                type="date"
                value={formData.scheduled_start_date}
                onChange={(e) => setFormData({ ...formData, scheduled_start_date: e.target.value })}
              />
              <Input
                label="End Date"
                type="date"
                value={formData.scheduled_end_date}
                onChange={(e) => setFormData({ ...formData, scheduled_end_date: e.target.value })}
              />
              <Input
                label="Assigned Machine"
                value={formData.assigned_machine}
                onChange={(e) => setFormData({ ...formData, assigned_machine: e.target.value })}
                placeholder="e.g., HB1, HB2, UV#1, Dye 1"
              />
              <Select
                label="Assigned Operator"
                options={[
                  { value: '', label: 'Select Operator' },
                  ...(usersResponse?.map((user: User) => ({
                    value: user.id,
                    label: user.full_name,
                  })) || []),
                ]}
                value={formData.assigned_operator_id}
                onChange={(e) => setFormData({ ...formData, assigned_operator_id: e.target.value })}
              />
              <Input
                label="Estimated Hours"
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: Number(e.target.value) })}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes or instructions..."
                />
              </div>
            </div>

            {createMutation.isError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                Error creating production job
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Job'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {showWorkflowModal && selectedJobId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Production Workflow</h2>
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
            <div className="text-center py-8 text-gray-500">
              Workflow details would be displayed here
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
