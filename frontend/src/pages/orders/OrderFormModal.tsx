import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Checkbox } from '../../components/ui/Checkbox';

interface OrderFormData {
  customer_id: string;
  order_date: string;
  product_name: string;
  quantity: number;
  unit: string;
  delivery_date: string;
  priority: string;
  final_price: number;
  special_instructions: string;
  product_type?: string;
  is_repeat_order?: boolean;
  previous_order_id?: string;
  card_width?: string;
  card_length?: string;
  strength?: string;
  type?: string;
  color_cyan?: string;
  color_magenta?: string;
  color_yellow?: string;
  color_black?: string;
  color_p1?: string;
  color_p2?: string;
  color_p3?: string;
  color_p4?: string;
  varnish_type?: string;
  varnish_details?: string;
  lamination_type?: string;
  lamination_size?: string;
  uv_emboss_details?: string;
  has_back_printing?: boolean;
  has_barcode?: boolean;
  batch_number?: string;
  ctp_info?: string;
  die_type?: string;
  die_reference?: string;
  emboss_film_details?: string;
  plate_reference?: string;
  designer_name?: string;
  cylinder_reference?: string;
  cylinder_sent_date?: string;
  cylinder_approved_date?: string;
  cylinder_received_date?: string;
  thickness_micron?: number;
  tablet_size?: string;
  punch_size?: string;
}

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OrderFormData) => void;
  customers: any[];
  isSubmitting: boolean;
  error: boolean;
}

export default function OrderFormModal({
  isOpen,
  onClose,
  onSubmit,
  customers,
  isSubmitting,
  error,
}: OrderFormModalProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    customer_id: '',
    order_date: new Date().toISOString().split('T')[0],
    product_name: '',
    quantity: 0,
    unit: 'pieces',
    delivery_date: '',
    priority: 'normal',
    final_price: 0,
    special_instructions: '',
    product_type: 'cpp_carton',
    is_repeat_order: false,
    has_back_printing: false,
    has_barcode: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Order"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Select
                label="Customer *"
                options={[
                  { value: '', label: 'Select Customer' },
                  ...(customers?.map((customer: any) => ({
                    value: customer.id,
                    label: `${customer.name} ${customer.company_name ? `(${customer.company_name})` : ''}`,
                  })) || []),
                ]}
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              />
            </div>

            <Select
              label="Product Type *"
              options={[
                { value: 'cpp_carton', label: 'CPP Carton' },
                { value: 'silvo_blister', label: 'Silvo/Blister Foil' },
                { value: 'bent_foil', label: 'Bent Foil' },
                { value: 'alu_alu', label: 'Alu-Alu' },
              ]}
              value={formData.product_type}
              onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
            />

            <Input
              label="Order Date *"
              type="date"
              required
              value={formData.order_date}
              onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
            />

            <Input
              label="Delivery Date *"
              type="date"
              required
              value={formData.delivery_date}
              onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
            />

            <div className="md:col-span-2">
              <Input
                label="Product Name *"
                required
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                placeholder="e.g., Business Cards, Packaging Box"
              />
            </div>

            <Input
              label="Quantity *"
              type="number"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            />

            <Select
              label="Unit *"
              options={[
                { value: 'pieces', label: 'Pieces' },
                { value: 'boxes', label: 'Boxes' },
                { value: 'reams', label: 'Reams' },
                { value: 'kg', label: 'Kg' },
              ]}
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />

            <Select
              label="Priority *"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            />

            <Input
              label="Final Price"
              type="number"
              value={formData.final_price}
              onChange={(e) => setFormData({ ...formData, final_price: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Specifications Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Card Width (mm)"
              value={formData.card_width || ''}
              onChange={(e) => setFormData({ ...formData, card_width: e.target.value })}
              placeholder="e.g., 100"
            />

            <Input
              label="Card Length (mm)"
              value={formData.card_length || ''}
              onChange={(e) => setFormData({ ...formData, card_length: e.target.value })}
              placeholder="e.g., 150"
            />

            <Input
              label="Strength"
              value={formData.strength || ''}
              onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
              placeholder="e.g., 300 GSM"
            />

            <Input
              label="Type"
              value={formData.type || ''}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            />

            <div className="md:col-span-2">
              <Input
                label="Batch Number"
                value={formData.batch_number || ''}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
              />
            </div>

            <Input
              label="Cyan (%)"
              value={formData.color_cyan || ''}
              onChange={(e) => setFormData({ ...formData, color_cyan: e.target.value })}
              placeholder="e.g., 100"
            />

            <Input
              label="Magenta (%)"
              value={formData.color_magenta || ''}
              onChange={(e) => setFormData({ ...formData, color_magenta: e.target.value })}
              placeholder="e.g., 50"
            />

            <Input
              label="Yellow (%)"
              value={formData.color_yellow || ''}
              onChange={(e) => setFormData({ ...formData, color_yellow: e.target.value })}
              placeholder="e.g., 0"
            />

            <Input
              label="Black (%)"
              value={formData.color_black || ''}
              onChange={(e) => setFormData({ ...formData, color_black: e.target.value })}
              placeholder="e.g., 25"
            />

            <Input
              label="Pantone 1"
              value={formData.color_p1 || ''}
              onChange={(e) => setFormData({ ...formData, color_p1: e.target.value })}
            />

            <Input
              label="Pantone 2"
              value={formData.color_p2 || ''}
              onChange={(e) => setFormData({ ...formData, color_p2: e.target.value })}
            />

            <Input
              label="Pantone 3"
              value={formData.color_p3 || ''}
              onChange={(e) => setFormData({ ...formData, color_p3: e.target.value })}
            />

            <Input
              label="Pantone 4"
              value={formData.color_p4 || ''}
              onChange={(e) => setFormData({ ...formData, color_p4: e.target.value })}
            />

            {formData.product_type === 'silvo_blister' && (
              <>
                <Input
                  label="Cylinder Reference"
                  value={formData.cylinder_reference || ''}
                  onChange={(e) => setFormData({ ...formData, cylinder_reference: e.target.value })}
                />

                <Input
                  label="Cylinder Sent Date"
                  type="date"
                  value={formData.cylinder_sent_date || ''}
                  onChange={(e) => setFormData({ ...formData, cylinder_sent_date: e.target.value })}
                />
              </>
            )}

            {(formData.product_type === 'bent_foil' || formData.product_type === 'alu_alu') && (
              <>
                <Input
                  label="Thickness (Micron)"
                  type="number"
                  value={formData.thickness_micron || ''}
                  onChange={(e) => setFormData({ ...formData, thickness_micron: Number(e.target.value) })}
                />

                <Input
                  label="Tablet Size"
                  value={formData.tablet_size || ''}
                  onChange={(e) => setFormData({ ...formData, tablet_size: e.target.value })}
                />

                <Input
                  label="Punch Size"
                  value={formData.punch_size || ''}
                  onChange={(e) => setFormData({ ...formData, punch_size: e.target.value })}
                />
              </>
            )}
          </div>
        </div>

        {/* Finishing Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Finishing Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Varnish Type"
              options={[
                { value: 'none', label: 'None' },
                { value: 'water_base', label: 'Water Base' },
                { value: 'duck', label: 'Duck' },
                { value: 'plain_uv', label: 'Plain UV' },
                { value: 'spot_uv', label: 'Spot UV' },
                { value: 'drip_off_uv', label: 'Drip Off UV' },
                { value: 'matt_uv', label: 'Matt UV' },
                { value: 'rough_uv', label: 'Rough UV' },
              ]}
              value={formData.varnish_type || 'none'}
              onChange={(e) => setFormData({ ...formData, varnish_type: e.target.value })}
            />

            <Select
              label="Lamination Type"
              options={[
                { value: 'none', label: 'None' },
                { value: 'shine', label: 'Shine' },
                { value: 'matt', label: 'Matt' },
                { value: 'metalize', label: 'Metalize' },
                { value: 'rainbow', label: 'Rainbow' },
              ]}
              value={formData.lamination_type || 'none'}
              onChange={(e) => setFormData({ ...formData, lamination_type: e.target.value })}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Varnish Details</label>
              <textarea
                value={formData.varnish_details || ''}
                onChange={(e) => setFormData({ ...formData, varnish_details: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <Input
              label="Lamination Size"
              value={formData.lamination_size || ''}
              onChange={(e) => setFormData({ ...formData, lamination_size: e.target.value })}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">UV Emboss Details</label>
              <textarea
                value={formData.uv_emboss_details || ''}
                onChange={(e) => setFormData({ ...formData, uv_emboss_details: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2 flex gap-4">
              <Checkbox
                label="Has Back Printing"
                checked={formData.has_back_printing || false}
                onChange={(e) => setFormData({ ...formData, has_back_printing: e.target.checked })}
              />

              <Checkbox
                label="Has Barcode"
                checked={formData.has_barcode || false}
                onChange={(e) => setFormData({ ...formData, has_barcode: e.target.checked })}
              />
            </div>
          </div>
        </div>

        {/* Pre-Press Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pre-Press Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">CTP Info</label>
              <textarea
                value={formData.ctp_info || ''}
                onChange={(e) => setFormData({ ...formData, ctp_info: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <Select
              label="Die Type"
              options={[
                { value: 'none', label: 'None' },
                { value: 'new_die', label: 'New Die' },
                { value: 'old_die', label: 'Old Die' },
              ]}
              value={formData.die_type || 'none'}
              onChange={(e) => setFormData({ ...formData, die_type: e.target.value })}
            />

            <Input
              label="Die Reference"
              value={formData.die_reference || ''}
              onChange={(e) => setFormData({ ...formData, die_reference: e.target.value })}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Emboss Film Details</label>
              <textarea
                value={formData.emboss_film_details || ''}
                onChange={(e) => setFormData({ ...formData, emboss_film_details: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <Input
              label="Plate Reference"
              value={formData.plate_reference || ''}
              onChange={(e) => setFormData({ ...formData, plate_reference: e.target.value })}
            />

            <Input
              label="Designer Name"
              value={formData.designer_name || ''}
              onChange={(e) => setFormData({ ...formData, designer_name: e.target.value })}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
              <textarea
                value={formData.special_instructions}
                onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            Error creating order
          </div>
        )}
      </form>

      {/* Footer Actions */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Creating...' : 'Create Order'}
        </Button>
      </div>
    </Modal>
  );
}
