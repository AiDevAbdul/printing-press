import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

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

interface InventoryItem {
  id: string;
  item_code: string;
  item_name: string;
  unit_cost: number;
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
      const response = await api.get(`/costing/jobs/${selectedJobId}`);
      return response.data;
    },
    enabled: !!selectedJobId,
  });

  const { data: summaryResponse } = useQuery({
    queryKey: ['job-cost-summary', selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return null;
      const response = await api.get(`/costing/jobs/${selectedJobId}/summary`);
      return response.data;
    },
    enabled: !!selectedJobId,
  });

  const { data: inventoryResponse } = useQuery({
    queryKey: ['inventory-for-costing'],
    queryFn: async () => {
      const response = await api.get('/inventory/items');
      return response.data;
    },
    enabled: isModalOpen && formData.cost_type === 'material',
  });

  const { data: calculationResponse, isLoading: isCalculating } = useQuery({
    queryKey: ['cost-calculation', selectedJobId, prePressCost],
    queryFn: async () => {
      if (!selectedJobId) return null;
      const payload: any = { job_id: selectedJobId };
      if (prePressCost !== undefined) {
        payload.pre_press_charges = prePressCost;
      }
      const response = await api.post('/costing/calculate', payload);
      return response.data;
    },
    enabled: !!selectedJobId && showCalculation,
  });

  const saveCalculationMutation = useMutation({
    mutationFn: async () => {
      const payload: any = { job_id: selectedJobId };
      if (prePressCost !== undefined) {
        payload.pre_press_charges = prePressCost;
      }
      const response = await api.post('/costing/calculate/save', payload);
      return response.data;
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
        job_id: data.job_id,
        cost_type: data.cost_type,
        item_id: data.item_id || undefined,
        description: data.description,
        quantity: Number(data.quantity),
        unit_cost: Number(data.unit_cost),
      };
      const response = await api.post(`/costing/jobs/${data.job_id}/costs`, payload);
      return response.data;
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
      await api.delete(`/costing/costs/${id}`);
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

  const handleInventoryItemChange = (itemId: string) => {
    const selectedItem = inventoryResponse?.data?.find((item: InventoryItem) => item.id === itemId);
    if (selectedItem) {
      setFormData(prev => ({
        ...prev,
        item_id: itemId,
        description: selectedItem.item_name,
        unit_cost: Number(selectedItem.unit_cost),
      }));
    }
  };

  const costs: JobCost[] = costsResponse?.data || [];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Costing</h1>
          <p className="mt-2 text-gray-600">Track costs for production jobs</p>
        </div>
        <button
          onClick={() => {
            setFormData({ ...formData, job_id: selectedJobId });
            setIsModalOpen(true);
          }}
          disabled={!selectedJobId}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Cost
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Production Job</option>
          {jobsResponse?.data?.map((job: ProductionJob) => (
            <option key={job.id} value={job.id}>
              {job.job_number} - {job.order.order_number} - {job.order.product_name}
            </option>
          ))}
        </select>
        {selectedJobId && (
          <button
            onClick={() => setShowCalculation(!showCalculation)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500"
          >
            {showCalculation ? 'Hide Calculation' : 'Auto-Calculate Cost'}
          </button>
        )}
      </div>

      {selectedJobId && showCalculation && (
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Auto-Calculated Cost Breakdown</h2>

          {isCalculating ? (
            <div className="text-center py-8">Calculating costs...</div>
          ) : calculationResponse ? (
            <>
              <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Product Specifications (Auto-Loaded)</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Card Size:</span>{' '}
                    <span className="font-medium">
                      {calculationResponse.specifications.card_length}cm × {calculationResponse.specifications.card_width}cm
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">GSM:</span>{' '}
                    <span className="font-medium">{calculationResponse.specifications.card_gsm}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Quantity:</span>{' '}
                    <span className="font-medium">{calculationResponse.specifications.quantity} pieces</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>{' '}
                    <span className="font-medium">{calculationResponse.specifications.card_type || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Colors:</span>{' '}
                    <span className="font-medium">
                      {calculationResponse.specifications.colors_cmyk ? 'CMYK' : ''}
                      {calculationResponse.specifications.special_colors_count > 0 &&
                        ` + ${calculationResponse.specifications.special_colors_count} Special`}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Finishing:</span>{' '}
                    <span className="font-medium">
                      {calculationResponse.specifications.uv_type !== 'none' && calculationResponse.specifications.uv_type}
                      {calculationResponse.specifications.lamination_required && ', Lamination'}
                      {calculationResponse.specifications.embossing_required && ', Embossing'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Cost Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-700">Material Cost</span>
                    <span className="font-medium">₹{calculationResponse.cost_breakdown.material_cost.toLocaleString()}</span>
                  </div>

                  <div className="pl-4">
                    <div className="flex justify-between py-1 text-sm">
                      <span className="text-gray-600">CMYK (4 colors)</span>
                      <span>₹{calculationResponse.cost_breakdown.printing_cost_cmyk.toLocaleString()}</span>
                    </div>
                    {calculationResponse.cost_breakdown.printing_cost_special > 0 && (
                      <div className="flex justify-between py-1 text-sm">
                        <span className="text-gray-600">Special Colors ({calculationResponse.specifications.special_colors_count})</span>
                        <span>₹{calculationResponse.cost_breakdown.printing_cost_special.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {calculationResponse.cost_breakdown.uv_cost > 0 && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700">UV Cost</span>
                      <span className="font-medium">₹{calculationResponse.cost_breakdown.uv_cost.toLocaleString()}</span>
                    </div>
                  )}

                  {calculationResponse.cost_breakdown.lamination_cost > 0 && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700">Lamination</span>
                      <span className="font-medium">₹{calculationResponse.cost_breakdown.lamination_cost.toLocaleString()}</span>
                    </div>
                  )}

                  {calculationResponse.cost_breakdown.embossing_cost > 0 && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700">Embossing</span>
                      <span className="font-medium">₹{calculationResponse.cost_breakdown.embossing_cost.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-700">Die Cutting</span>
                    <span className="font-medium">₹{calculationResponse.cost_breakdown.die_cutting_cost.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b items-center">
                    <span className="text-gray-700">Pre-Press Charges</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={prePressCost !== undefined ? prePressCost : calculationResponse.cost_breakdown.pre_press_charges}
                        onChange={(e) => setPrePressCost(Number(e.target.value))}
                        className="w-32 px-2 py-1 border border-gray-300 rounded text-right"
                      />
                      <button
                        onClick={() => setPrePressCost(undefined)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between py-3 border-t-2 border-gray-300 font-bold text-lg">
                    <span>TOTAL COST</span>
                    <span className="text-green-600">₹{calculationResponse.cost_breakdown.total_cost.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between py-2 text-sm text-gray-600">
                    <span>Cost per Unit</span>
                    <span>₹{calculationResponse.cost_breakdown.cost_per_unit.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => saveCalculationMutation.mutate()}
                  disabled={saveCalculationMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saveCalculationMutation.isPending ? 'Saving...' : 'Save Costing'}
                </button>
                <button
                  onClick={() => setShowCalculation(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>

              {saveCalculationMutation.isError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  Error saving cost calculation
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-red-600">
              Unable to calculate costs. Please ensure the order has complete specifications (card size, GSM, quantity).
            </div>
          )}
        </div>
      )}

      {selectedJobId && summaryResponse && (
        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Material Costs</p>
            <p className="text-2xl font-bold text-gray-900">₹{summaryResponse.materialCosts?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Labor Costs</p>
            <p className="text-2xl font-bold text-gray-900">₹{summaryResponse.laborCosts?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Machine Costs</p>
            <p className="text-2xl font-bold text-gray-900">₹{summaryResponse.machineCosts?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Costs</p>
            <p className="text-2xl font-bold text-gray-900">₹{summaryResponse.totalCosts?.toLocaleString() || 0}</p>
          </div>
        </div>
      )}

      {!selectedJobId ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 p-8 rounded-lg text-center">
          Please select a production job to view costs
        </div>
      ) : isLoading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          Error loading job costs
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {costs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No costs recorded for this job
                    </td>
                  </tr>
                ) : (
                  costs.map((cost) => (
                    <tr key={cost.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${costTypeColors[cost.cost_type]}`}>
                          {cost.cost_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{cost.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cost.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{Number(cost.unit_cost).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{Number(cost.total_cost).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(cost.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this cost?')) {
                              deleteMutation.mutate(cost.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add Job Cost</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Type *</label>
                  <select
                    required
                    value={formData.cost_type}
                    onChange={(e) => setFormData({ ...formData, cost_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="material">Material</option>
                    <option value="labor">Labor</option>
                    <option value="machine">Machine</option>
                    <option value="overhead">Overhead</option>
                  </select>
                </div>
                {formData.cost_type === 'material' && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inventory Item</label>
                    <select
                      value={formData.item_id}
                      onChange={(e) => handleInventoryItemChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Item (Optional)</option>
                      {inventoryResponse?.data?.map((item: InventoryItem) => (
                        <option key={item.id} value={item.id}>
                          {item.item_code} - {item.item_name} (₹{item.unit_cost})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost</label>
                  <input
                    type="number"
                    disabled
                    value={(formData.quantity * formData.unit_cost).toFixed(2)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
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
                  {createMutation.isPending ? 'Adding...' : 'Add Cost'}
                </button>
              </div>
              {createMutation.isError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  Error adding cost
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
