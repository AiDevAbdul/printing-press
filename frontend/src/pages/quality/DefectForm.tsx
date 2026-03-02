import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qualityService } from '../../services/quality.service';

interface DefectFormProps {
  onClose: () => void;
}

const DefectForm = ({ onClose }: DefectFormProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    inspection_id: '',
    category: '',
    severity: '',
    description: '',
    quantity: '1',
    root_cause: '',
    corrective_action: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);

  const createMutation = useMutation({
    mutationFn: ({ data, photo }: { data: any; photo?: File }) =>
      qualityService.createDefect(data, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defects'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      data: {
        ...formData,
        quantity: Number(formData.quantity),
      },
      photo: photo || undefined,
    });
  };

  const categories = [
    { value: 'printing', label: 'Printing' },
    { value: 'color_mismatch', label: 'Color Mismatch' },
    { value: 'registration', label: 'Registration' },
    { value: 'die_cutting', label: 'Die Cutting' },
    { value: 'lamination', label: 'Lamination' },
    { value: 'pasting', label: 'Pasting' },
    { value: 'material', label: 'Material' },
    { value: 'finishing', label: 'Finishing' },
    { value: 'other', label: 'Other' },
  ];

  const severities = [
    { value: 'minor', label: 'Minor' },
    { value: 'major', label: 'Major' },
    { value: 'critical', label: 'Critical' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-md my-8">
        <h2 className="text-xl font-bold mb-4">Log Defect</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Inspection ID *</label>
            <input
              type="text"
              value={formData.inspection_id}
              onChange={(e) => setFormData({ ...formData, inspection_id: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Severity *</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Select Severity</option>
              {severities.map((sev) => (
                <option key={sev.value} value={sev.value}>
                  {sev.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Root Cause</label>
            <textarea
              value={formData.root_cause}
              onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={2}
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {createMutation.isPending ? 'Logging...' : 'Log Defect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DefectForm;
