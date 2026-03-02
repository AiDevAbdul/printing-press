import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qualityService } from '../../services/quality.service';

interface RejectionFormProps {
  onClose: () => void;
}

const RejectionForm = ({ onClose }: RejectionFormProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    job_id: '',
    rejected_quantity: '',
    unit: 'pcs',
    reason: '',
    disposition: '',
    estimated_loss: '',
    corrective_action: '',
  });

  const createMutation = useMutation({
    mutationFn: qualityService.createRejection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rejections'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      rejected_quantity: Number(formData.rejected_quantity),
      estimated_loss: formData.estimated_loss ? Number(formData.estimated_loss) : undefined,
    });
  };

  const dispositions = [
    { value: 'scrap', label: 'Scrap' },
    { value: 'rework', label: 'Rework' },
    { value: 'use_as_is', label: 'Use As Is' },
    { value: 'return_to_vendor', label: 'Return to Vendor' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Record Rejection</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Job ID *</label>
            <input
              type="text"
              value={formData.job_id}
              onChange={(e) => setFormData({ ...formData, job_id: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Rejected Quantity *</label>
              <input
                type="number"
                value={formData.rejected_quantity}
                onChange={(e) => setFormData({ ...formData, rejected_quantity: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium mb-1">Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reason *</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Disposition *</label>
            <select
              value={formData.disposition}
              onChange={(e) => setFormData({ ...formData, disposition: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Select Disposition</option>
              {dispositions.map((disp) => (
                <option key={disp.value} value={disp.value}>
                  {disp.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Estimated Loss (₹)</label>
            <input
              type="number"
              step="0.01"
              value={formData.estimated_loss}
              onChange={(e) => setFormData({ ...formData, estimated_loss: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Corrective Action</label>
            <textarea
              value={formData.corrective_action}
              onChange={(e) => setFormData({ ...formData, corrective_action: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              {createMutation.isPending ? 'Recording...' : 'Record Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectionForm;
