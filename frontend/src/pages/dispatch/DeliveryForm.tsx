import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dispatchService } from '../../services/dispatch.service';

interface DeliveryFormProps {
  onClose: () => void;
}

const DeliveryForm = ({ onClose }: DeliveryFormProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    job_id: '',
    customer_id: '',
    delivery_type: 'courier',
    scheduled_date: '',
    courier_name: '',
    tracking_number: '',
    vehicle_number: '',
    driver_name: '',
    driver_phone: '',
    delivery_address: '',
    delivery_contact_name: '',
    delivery_contact_phone: '',
    delivery_notes: '',
  });

  const createMutation = useMutation({
    mutationFn: dispatchService.createDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
        <h2 className="text-xl font-bold mb-4">New Delivery</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium mb-1">Customer ID *</label>
              <input
                type="text"
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Type *</label>
              <select
                value={formData.delivery_type}
                onChange={(e) => setFormData({ ...formData, delivery_type: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="courier">Courier</option>
                <option value="own_transport">Own Transport</option>
                <option value="customer_pickup">Customer Pickup</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Scheduled Date *</label>
              <input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </div>

          {formData.delivery_type === 'courier' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Courier Name</label>
                <input
                  type="text"
                  value={formData.courier_name}
                  onChange={(e) => setFormData({ ...formData, courier_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={formData.tracking_number}
                  onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
          )}

          {formData.delivery_type === 'own_transport' && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle Number</label>
                <input
                  type="text"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Driver Name</label>
                <input
                  type="text"
                  value={formData.driver_name}
                  onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Driver Phone</label>
                <input
                  type="text"
                  value={formData.driver_phone}
                  onChange={(e) => setFormData({ ...formData, driver_phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Delivery Address *</label>
            <textarea
              value={formData.delivery_address}
              onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Contact Name</label>
              <input
                type="text"
                value={formData.delivery_contact_name}
                onChange={(e) => setFormData({ ...formData, delivery_contact_name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.delivery_contact_phone}
                onChange={(e) => setFormData({ ...formData, delivery_contact_phone: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.delivery_notes}
              onChange={(e) => setFormData({ ...formData, delivery_notes: e.target.value })}
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
              {createMutation.isPending ? 'Creating...' : 'Create Delivery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryForm;
