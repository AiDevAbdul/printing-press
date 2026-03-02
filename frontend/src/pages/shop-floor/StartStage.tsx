import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shopFloorService } from '../../services/shop-floor.service';

const StartStage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    stage: '',
    process: '',
    machine: '',
    counter_start: '',
    notes: '',
  });

  const startStageMutation = useMutation({
    mutationFn: shopFloorService.startStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-active-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      navigate(`/shop-floor/job/${id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startStageMutation.mutate({
      job_id: id!,
      stage: formData.stage,
      process: formData.process || undefined,
      machine: formData.machine || undefined,
      counter_start: formData.counter_start ? Number(formData.counter_start) : undefined,
      notes: formData.notes || undefined,
    });
  };

  const stages = [
    'Pre-Press',
    'Printing',
    'Lamination',
    'UV Coating',
    'Die Cutting',
    'Pasting',
    'Quality Check',
    'Packing',
  ];

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

      <h1 className="text-2xl font-bold mb-6">Start Stage</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-2">Stage *</label>
          <select
            value={formData.stage}
            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg text-lg"
            required
          >
            <option value="">Select Stage</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-2">Process</label>
          <input
            type="text"
            value={formData.process}
            onChange={(e) => setFormData({ ...formData, process: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg text-lg"
            placeholder="e.g., 4 Color CMYK"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-2">Machine</label>
          <input
            type="text"
            value={formData.machine}
            onChange={(e) => setFormData({ ...formData, machine: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg text-lg"
            placeholder="e.g., Heidelberg 1"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium mb-2">Counter Start</label>
          <input
            type="number"
            value={formData.counter_start}
            onChange={(e) => setFormData({ ...formData, counter_start: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg text-lg"
            placeholder="Machine counter reading"
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

        <button
          type="submit"
          disabled={startStageMutation.isPending}
          className="w-full py-4 bg-blue-600 text-white rounded-lg font-medium text-lg disabled:bg-gray-400"
        >
          {startStageMutation.isPending ? 'Starting...' : 'Start Stage'}
        </button>
      </form>
    </div>
  );
};

export default StartStage;
