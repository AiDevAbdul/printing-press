import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shopFloorService } from '../../services/shop-floor.service';

const IssueMaterial = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    material_name: '',
    material_code: '',
    quantity: '',
    unit: 'kg',
    notes: '',
  });

  const issueMaterialMutation = useMutation({
    mutationFn: shopFloorService.issueMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', id] });
      navigate(`/shop-floor/job/${id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    issueMaterialMutation.mutate({
      job_id: id!,
      material_name: formData.material_name,
      material_code: formData.material_code || undefined,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      notes: formData.notes || undefined,
    });
  };

  const units = ['kg', 'sheets', 'rolls', 'pcs', 'liters', 'meters'];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
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

      <h1 className="text-2xl font-bold mb-6">Issue Material</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-2">Material Name *</label>
          <input
            type="text"
            value={formData.material_name}
            onChange={(e) => setFormData({ ...formData, material_name: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg text-lg"
            placeholder="e.g., Art Paper 300 GSM"
            required
          />
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-2">Material Code</label>
          <input
            type="text"
            value={formData.material_code}
            onChange={(e) => setFormData({ ...formData, material_code: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg text-lg"
            placeholder="e.g., MAT-001"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-2">Quantity *</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="flex-1 px-4 py-3 border rounded-lg text-lg"
              placeholder="0.00"
              required
            />
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-32 px-4 py-3 border rounded-lg text-lg"
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
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

        <button
          type="submit"
          disabled={issueMaterialMutation.isPending}
          className="w-full py-4 bg-blue-600 text-white rounded-lg font-medium text-lg disabled:bg-gray-400"
        >
          {issueMaterialMutation.isPending ? 'Issuing...' : 'Issue Material'}
        </button>
      </form>
    </div>
  );
};

export default IssueMaterial;
