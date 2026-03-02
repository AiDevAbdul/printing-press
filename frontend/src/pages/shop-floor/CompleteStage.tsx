import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { shopFloorService } from '../../services/shop-floor.service';

const CompleteStage = () => {
  const { id, stageHistoryId } = useParams<{ id: string; stageHistoryId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    counter_end: '',
    good_quantity: '',
    waste_quantity: '',
    notes: '',
  });

  const [wastageRecords, setWastageRecords] = useState<Array<{
    wastage_type: string;
    quantity: string;
    unit: string;
    estimated_cost: string;
    reason: string;
  }>>([]);

  const completeStageMutation = useMutation({
    mutationFn: shopFloorService.completeStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-active-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      navigate(`/shop-floor/job/${id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const wastageData = wastageRecords
      .filter(w => w.wastage_type && w.quantity)
      .map(w => ({
        job_id: id!,
        stage_history_id: stageHistoryId!,
        wastage_type: w.wastage_type,
        quantity: Number(w.quantity),
        unit: w.unit || 'pcs',
        estimated_cost: w.estimated_cost ? Number(w.estimated_cost) : undefined,
        reason: w.reason || undefined,
      }));

    completeStageMutation.mutate({
      stage_history_id: stageHistoryId!,
      counter_end: formData.counter_end ? Number(formData.counter_end) : undefined,
      good_quantity: formData.good_quantity ? Number(formData.good_quantity) : undefined,
      waste_quantity: formData.waste_quantity ? Number(formData.waste_quantity) : undefined,
      notes: formData.notes || undefined,
      wastage_records: wastageData.length > 0 ? wastageData : undefined,
    });
  };

  const addWastageRecord = () => {
    setWastageRecords([
      ...wastageRecords,
      { wastage_type: '', quantity: '', unit: 'pcs', estimated_cost: '', reason: '' },
    ]);
  };

  const removeWastageRecord = (index: number) => {
    setWastageRecords(wastageRecords.filter((_, i) => i !== index));
  };

  const updateWastageRecord = (index: number, field: string, value: string) => {
    const updated = [...wastageRecords];
    updated[index] = { ...updated[index], [field]: value };
    setWastageRecords(updated);
  };

  const wastageTypes = [
    { value: 'setup_waste', label: 'Setup Waste' },
    { value: 'production_waste', label: 'Production Waste' },
    { value: 'quality_rejection', label: 'Quality Rejection' },
    { value: 'machine_error', label: 'Machine Error' },
    { value: 'material_defect', label: 'Material Defect' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="mb-4">
        <button
          onClick={() => navigate(`/shop-floor/job/${id}`)}
          className="text-blue-600 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Complete Stage</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-2">Counter End</label>
          <input
            type="number"
            value={formData.counter_end}
            onChange={(e) => setFormData({ ...formData, counter_end: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg text-lg"
            placeholder="Final machine counter reading"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-2">Good Quantity</label>
          <input
            type="number"
            value={formData.good_quantity}
            onChange={(e) => setFormData({ ...formData, good_quantity: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg text-lg"
            placeholder="Number of good pieces"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-2">Waste Quantity</label>
          <input
            type="number"
            value={formData.waste_quantity}
            onChange={(e) => setFormData({ ...formData, waste_quantity: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg text-lg"
            placeholder="Number of waste pieces"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg text-lg"
            rows={3}
            placeholder="Any additional notes..."
          />
        </div>

        {/* Wastage Records */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Wastage Details (Optional)</h2>
            <button
              type="button"
              onClick={addWastageRecord}
              className="text-blue-600 text-sm"
            >
              + Add Wastage
            </button>
          </div>

          {wastageRecords.map((record, index) => (
            <div key={index} className="border-t pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">Wastage #{index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeWastageRecord(index)}
                  className="text-red-600 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-3">
                <select
                  value={record.wastage_type}
                  onChange={(e) => updateWastageRecord(index, 'wastage_type', e.target.value)}
                  className="w-full px-3 py-2 border rounded text-base"
                >
                  <option value="">Select Type</option>
                  {wastageTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <input
                    type="number"
                    value={record.quantity}
                    onChange={(e) => updateWastageRecord(index, 'quantity', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded text-base"
                    placeholder="Quantity"
                  />
                  <input
                    type="text"
                    value={record.unit}
                    onChange={(e) => updateWastageRecord(index, 'unit', e.target.value)}
                    className="w-24 px-3 py-2 border rounded text-base"
                    placeholder="Unit"
                  />
                </div>

                <input
                  type="number"
                  value={record.estimated_cost}
                  onChange={(e) => updateWastageRecord(index, 'estimated_cost', e.target.value)}
                  className="w-full px-3 py-2 border rounded text-base"
                  placeholder="Estimated Cost (₹)"
                />

                <textarea
                  value={record.reason}
                  onChange={(e) => updateWastageRecord(index, 'reason', e.target.value)}
                  className="w-full px-3 py-2 border rounded text-base"
                  rows={2}
                  placeholder="Reason for wastage"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={completeStageMutation.isPending}
          className="w-full py-4 bg-green-600 text-white rounded-lg font-medium text-lg disabled:bg-gray-400"
        >
          {completeStageMutation.isPending ? 'Completing...' : 'Complete Stage'}
        </button>
      </form>
    </div>
  );
};

export default CompleteStage;
