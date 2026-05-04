import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qualityService } from '../../services/quality.service';

interface InspectionFormProps {
  onClose: () => void;
}

const InspectionForm = ({ onClose }: InspectionFormProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    job_id: '',
    checkpoint_id: '',
    sample_size: '',
    notes: '',
  });

  const createMutation = useMutation({
    mutationFn: qualityService.createInspection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      sample_size: formData.sample_size ? Number(formData.sample_size) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">New Inspection</h2>
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

          <div>
            <label className="block text-sm font-medium mb-1">Checkpoint ID *</label>
            <input
              type="text"
              value={formData.checkpoint_id}
              onChange={(e) => setFormData({ ...formData, checkpoint_id: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sample Size</label>
            <input
              type="number"
              value={formData.sample_size}
              onChange={(e) => setFormData({ ...formData, sample_size: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={3}
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Inspection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InspectionForm;
