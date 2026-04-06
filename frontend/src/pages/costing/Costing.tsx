import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import costingService from '../../services/costing.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';

interface JobCost {
  id: string;
  job: {
    job_number: string;
    order: {
      order_number: string;
      product_name: string;
    };
  };
  cost_type: string;
  description: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  created_at: string;
}

interface ProductionJob {
  id: string;
  job_number: string;
  order: {
    order_number: string;
    product_name: string;
  };
}

interface JobCostFormData {
  job_id: string;
  cost_type: string;
  item_id: string;
  description: string;
  quantity: number;
  unit_cost: number;
}

const costTypeColors: Record<string, string> = {
  material: 'bg-blue-100 text-blue-800',
  labor: 'bg-green-100 text-green-800',
  machine: 'bg-purple-100 text-purple-800',
  overhead: 'bg-yellow-100 text-yellow-800',
};

export default function Costing() {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);
  const [prePressCost, setPrePressCost] = useState<number | undefined>(undefined);
  const [formData, setFormData] = useState<JobCostFormData>({
    job_id: '',
    cost_type: 'material',
    item_id: '',
    description: '',
    quantity: 0,
    unit_cost: 0,
  });

  const queryClient = useQueryClient();

  const { data: jobsResponse } = useQuery({
    queryKey: ['production-jobs-for-costing'],
    queryFn: async () => {
      const response = await api.get('/production/jobs');
      return response.data;
    },
  });

  const { data: costsResponse, isLoading, error } = useQuery({
    queryKey: ['job-costs', selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return { data: [] };
      return costingService.getJobCosts(selectedJobId);
    },
    enabled: !!selectedJobId,
  });

  const { data: summaryResponse } = useQuery({
    queryKey: ['job-cost-summary', selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return null;
      return costingService.getJobCostSummary(selectedJobId);
    },
    enabled: !!selectedJobId,
  });

  const { data: calculationResponse, isLoading: isCalculating } = useQuery({
    queryKey: ['cost-calculation', selectedJobId, prePressCost],
    queryFn: async () => {
      if (!selectedJobId) return null;
      const payload: any = {};
      if (prePressCost !== undefined) {
        payload.pre_press_charges = prePressCost;
      }
      return costingService.calculateJobCost(selectedJobId, payload);
    },
    enabled: !!selectedJobId && showCalculation,
  });

  const saveCalculationMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {};
      if (prePressCost !== undefined) {
        payload.pre_press_charges = prePressCost;
      }
      return costingService.saveCalculatedCost(selectedJobId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-costs'] });
      queryClient.invalidateQueries({ queryKey: ['job-cost-summary'] });
      setShowCalculation(false);
      setPrePressCost(undefined);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: JobCostFormData) => {
      const payload = {
        cost_type: data.cost_type,
        item_id: data.item_id || undefined,
        description: data.description,
        quantity: Number(data.quantity),
        unit_cost: Number(data.unit_cost),
      };
      return costingService.createJobCost(data.job_id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-costs'] });
      queryClient.invalidateQueries({ queryKey: ['job-cost-summary'] });
      setIsModalOpen(false);
      setFormData({
        job_id: '',
        cost_type: 'material',
        item_id: '',
        description: '',
        quantity: 0,
        unit_cost: 0,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return costingService.deleteJobCost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-costs'] });
      queryClient.invalidateQueries({ queryKey: ['job-cost-summary'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const costs: JobCost[] = costsResponse?.data || [];

  return (
    <div className="space-y-6">
      {/* Job Selection */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
        <div className="flex-1">
          <Select
            label="Select Production Job"
            options={[
              { value: '', label: 'Select Production Job' },
              ...(jobsResponse?.data?.map((job: ProductionJob) => ({
                value: job.id,
                label: `${job.job_number} - ${job.order.order_number} - ${job.order.product_name}`,
              })) || []),
            ]}
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          />
        </div>
        {selectedJobId && (
          <Button
            variant={showCalculation ? 'danger' : 'primary'}
            size="md"
            onClick={() => setShowCalculation(!showCalculation)}
          >
            {showCalculation ? 'Hide Calculation' : 'Auto-Calculate Cost'}
          </Button>
        )}
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setFormData({ ...formData, job_id: selectedJobId });
            setIsModalOpen(true);
          }}
          disabled={!selectedJobId}
        >
          Add Cost
        </Button>
      </div>

      {/* Cost Summary Cards */}
      {selectedJobId && summaryResponse && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="elevated">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Material Costs</p>
              <p className="text-2xl font-bold text-gray-900">₹{summaryResponse.materialCosts?.toLocaleString() || 0}</p>
            </div>
          </Card>
          <Card variant="elevated">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Labor Costs</p>
              <p className="text-2xl font-bold text-gray-900">₹{summaryResponse.laborCosts?.toLocaleString() || 0}</p>
            </div>
          </Card>
          <Card variant="elevated">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Machine Costs</p>
              <p className="text-2xl font-bold text-gray-900">₹{summaryResponse.machineCosts?.toLocaleString() || 0}</p>
            </div>
          </Card>
          <Card variant="elevated">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Total Costs</p>
              <p className="text-2xl font-bold text-green-600">₹{summaryResponse.totalCosts?.toLocaleString() || 0}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Auto-Calculation Section */}
      {selectedJobId && showCalculation && (
        <Card variant="elevated">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Auto-Calculated Cost Breakdown</h3>

            {isCalculating ? (
              <div className="text-center py-8 text-gray-500">Calculating costs...</div>
            ) : calculationResponse ? (
              <>
                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-gray-900">Product Specifications</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Card Size:</span>
                      <p className="font-medium">{calculationResponse.specifications.card_length}cm × {calculationResponse.specifications.card_width}cm</p>
                    </div>
                    <div>
                      <span className="text-gray-600">GSM:</span>
                      <p className="font-medium">{calculationResponse.specifications.card_gsm}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Quantity:</span>
                      <p className="font-medium">{calculationResponse.specifications.quantity} pieces</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Cost Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span>Material Cost</span>
                      <span className="font-medium">₹{calculationResponse.cost_breakdown.material_cost.toLocaleString()}</span>
                    </div>
                    {calculationResponse.cost_breakdown.uv_cost > 0 && (
                      <div className="flex justify-between py-2 border-b">
                        <span>UV Cost</span>
                        <span className="font-medium">₹{calculationResponse.cost_breakdown.uv_cost.toLocaleString()}</span>
                      </div>
                    )}
                    {calculationResponse.cost_breakdown.lamination_cost > 0 && (
                      <div className="flex justify-between py-2 border-b">
                        <span>Lamination</span>
                        <span className="font-medium">₹{calculationResponse.cost_breakdown.lamination_cost.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 border-t-2 border-gray-300 font-bold text-base">
                      <span>TOTAL COST</span>
                      <span className="text-green-600">₹{calculationResponse.cost_breakdown.total_cost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="primary"
                    onClick={() => saveCalculationMutation.mutate()}
                    disabled={saveCalculationMutation.isPending}
                  >
                    {saveCalculationMutation.isPending ? 'Saving...' : 'Save Costing'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowCalculation(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-red-600">
                Unable to calculate costs. Please ensure the order has complete specifications.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Costs Table */}
      {!selectedJobId ? (
        <Card variant="outlined" className="p-8 text-center">
          <p className="text-gray-500">Please select a production job to view costs</p>
        </Card>
      ) : isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <Card variant="outlined" className="p-4 border-red-200 bg-red-50">
          <p className="text-red-700">Error loading job costs</p>
        </Card>
      ) : (
        <Card variant="elevated">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Cost Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Description</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Quantity</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Unit Cost</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {costs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                      No costs recorded for this job
                    </td>
                  </tr>
                ) : (
                  costs.map((cost) => (
                    <tr key={cost.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${costTypeColors[cost.cost_type]}`}>
                          {cost.cost_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-900">{cost.description}</td>
                      <td className="px-4 py-3 text-gray-600">{cost.quantity}</td>
                      <td className="px-4 py-3 text-gray-900">₹{Number(cost.unit_cost).toLocaleString()}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">₹{Number(cost.total_cost).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(cost.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            if (confirm('Delete this cost?')) {
                              deleteMutation.mutate(cost.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Job Cost"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Cost Type *"
            options={[
              { value: 'material', label: 'Material' },
              { value: 'labor', label: 'Labor' },
              { value: 'machine', label: 'Machine' },
              { value: 'overhead', label: 'Overhead' },
            ]}
            value={formData.cost_type}
            onChange={(e) => setFormData({ ...formData, cost_type: e.target.value })}
          />

          <Input
            label="Description *"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Cost description"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity *"
              type="number"
              required
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            />
            <Input
              label="Unit Cost *"
              type="number"
              required
              step="0.01"
              value={formData.unit_cost}
              onChange={(e) => setFormData({ ...formData, unit_cost: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Total Cost"
            type="number"
            disabled
            value={(formData.quantity * formData.unit_cost).toFixed(2)}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Adding...' : 'Add Cost'}
            </Button>
          </div>

          {createMutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              Error adding cost
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
