import { useState } from 'react';

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
  card_size?: string;
  strength?: string;
  type?: string;
  color_cmyk?: string;
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
  const [currentStep, setCurrentStep] = useState(1);
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: 'Basic Info' },
      { num: 2, label: 'Specifications' },
      { num: 3, label: 'Finishing' },
      { num: 4, label: 'Pre-Press' },
      { num: 5, label: 'Review' },
    ];

    return (
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <div key={step.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step.num
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.num}
              </div>
              <span className="text-xs mt-1 text-gray-600">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 ${
                  currentStep > step.num ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
        <select
          required
          value={formData.customer_id}
          onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Customer</option>
          {customers?.map((customer: any) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} {customer.company_name && `(${customer.company_name})`}
            </option>
          ))}
        </select>
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Type *</label>
        <select
          required
          value={formData.product_type}
          onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="cpp_carton">CPP Carton</option>
          <option value="silvo_blister">Silvo/Blister Foil</option>
          <option value="bent_foil">Bent Foil</option>
          <option value="alu_alu">Alu-Alu</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Order Date *</label>
        <input
          type="date"
          required
          value={formData.order_date}
          onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date *</label>
        <input
          type="date"
          required
          value={formData.delivery_date}
          onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
        <input
          type="text"
          required
          value={formData.product_name}
          onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
        <input
          type="number"
          required
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
        <select
          required
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="pieces">Pieces</option>
          <option value="boxes">Boxes</option>
          <option value="reams">Reams</option>
          <option value="kg">Kg</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
        <select
          required
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Final Price</label>
        <input
          type="number"
          value={formData.final_price}
          onChange={(e) => setFormData({ ...formData, final_price: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Card Size</label>
        <input
          type="text"
          value={formData.card_size || ''}
          onChange={(e) => setFormData({ ...formData, card_size: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 10x15 cm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Strength</label>
        <input
          type="text"
          value={formData.strength || ''}
          onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 300 GSM"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <input
          type="text"
          value={formData.type || ''}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
        <input
          type="text"
          value={formData.batch_number || ''}
          onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Color CMYK</label>
        <input
          type="text"
          value={formData.color_cmyk || ''}
          onChange={(e) => setFormData({ ...formData, color_cmyk: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., C100 M50 Y0 K25"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pantone 1</label>
        <input
          type="text"
          value={formData.color_p1 || ''}
          onChange={(e) => setFormData({ ...formData, color_p1: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pantone 2</label>
        <input
          type="text"
          value={formData.color_p2 || ''}
          onChange={(e) => setFormData({ ...formData, color_p2: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pantone 3</label>
        <input
          type="text"
          value={formData.color_p3 || ''}
          onChange={(e) => setFormData({ ...formData, color_p3: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pantone 4</label>
        <input
          type="text"
          value={formData.color_p4 || ''}
          onChange={(e) => setFormData({ ...formData, color_p4: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {formData.product_type === 'silvo_blister' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cylinder Reference</label>
            <input
              type="text"
              value={formData.cylinder_reference || ''}
              onChange={(e) => setFormData({ ...formData, cylinder_reference: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cylinder Sent Date</label>
            <input
              type="date"
              value={formData.cylinder_sent_date || ''}
              onChange={(e) => setFormData({ ...formData, cylinder_sent_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      )}

      {(formData.product_type === 'bent_foil' || formData.product_type === 'alu_alu') && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thickness (Micron)</label>
            <input
              type="number"
              value={formData.thickness_micron || ''}
              onChange={(e) => setFormData({ ...formData, thickness_micron: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tablet Size</label>
            <input
              type="text"
              value={formData.tablet_size || ''}
              onChange={(e) => setFormData({ ...formData, tablet_size: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Punch Size</label>
            <input
              type="text"
              value={formData.punch_size || ''}
              onChange={(e) => setFormData({ ...formData, punch_size: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Varnish Type</label>
        <select
          value={formData.varnish_type || 'none'}
          onChange={(e) => setFormData({ ...formData, varnish_type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="none">None</option>
          <option value="water_base">Water Base</option>
          <option value="duck">Duck</option>
          <option value="plain_uv">Plain UV</option>
          <option value="spot_uv">Spot UV</option>
          <option value="drip_off_uv">Drip Off UV</option>
          <option value="matt_uv">Matt UV</option>
          <option value="rough_uv">Rough UV</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Lamination Type</label>
        <select
          value={formData.lamination_type || 'none'}
          onChange={(e) => setFormData({ ...formData, lamination_type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="none">None</option>
          <option value="shine">Shine</option>
          <option value="matt">Matt</option>
          <option value="metalize">Metalize</option>
          <option value="rainbow">Rainbow</option>
        </select>
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Varnish Details</label>
        <textarea
          value={formData.varnish_details || ''}
          onChange={(e) => setFormData({ ...formData, varnish_details: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Lamination Size</label>
        <input
          type="text"
          value={formData.lamination_size || ''}
          onChange={(e) => setFormData({ ...formData, lamination_size: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">UV Emboss Details</label>
        <textarea
          value={formData.uv_emboss_details || ''}
          onChange={(e) => setFormData({ ...formData, uv_emboss_details: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="col-span-2 flex gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.has_back_printing || false}
            onChange={(e) => setFormData({ ...formData, has_back_printing: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">Has Back Printing</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.has_barcode || false}
            onChange={(e) => setFormData({ ...formData, has_barcode: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">Has Barcode</span>
        </label>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">CTP Info</label>
        <textarea
          value={formData.ctp_info || ''}
          onChange={(e) => setFormData({ ...formData, ctp_info: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Die Type</label>
        <select
          value={formData.die_type || 'none'}
          onChange={(e) => setFormData({ ...formData, die_type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="none">None</option>
          <option value="new_die">New Die</option>
          <option value="old_die">Old Die</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Die Reference</label>
        <input
          type="text"
          value={formData.die_reference || ''}
          onChange={(e) => setFormData({ ...formData, die_reference: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Emboss Film Details</label>
        <textarea
          value={formData.emboss_film_details || ''}
          onChange={(e) => setFormData({ ...formData, emboss_film_details: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Plate Reference</label>
        <input
          type="text"
          value={formData.plate_reference || ''}
          onChange={(e) => setFormData({ ...formData, plate_reference: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Designer Name</label>
        <input
          type="text"
          value={formData.designer_name || ''}
          onChange={(e) => setFormData({ ...formData, designer_name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
        <textarea
          value={formData.special_instructions}
          onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Review Order Details</h3>

      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="font-medium">Customer:</span> {customers?.find(c => c.id === formData.customer_id)?.name}</div>
          <div><span className="font-medium">Product Type:</span> {formData.product_type?.replace('_', ' ').toUpperCase()}</div>
          <div><span className="font-medium">Product Name:</span> {formData.product_name}</div>
          <div><span className="font-medium">Quantity:</span> {formData.quantity} {formData.unit}</div>
          <div><span className="font-medium">Order Date:</span> {formData.order_date}</div>
          <div><span className="font-medium">Delivery Date:</span> {formData.delivery_date}</div>
          <div><span className="font-medium">Priority:</span> {formData.priority}</div>
          <div><span className="font-medium">Price:</span> ₹{formData.final_price}</div>
        </div>
      </div>

      {formData.card_size && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Specifications</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {formData.card_size && <div><span className="font-medium">Card Size:</span> {formData.card_size}</div>}
            {formData.strength && <div><span className="font-medium">Strength:</span> {formData.strength}</div>}
            {formData.color_cmyk && <div><span className="font-medium">CMYK:</span> {formData.color_cmyk}</div>}
          </div>
        </div>
      )}

      {(formData.varnish_type !== 'none' || formData.lamination_type !== 'none') && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Finishing</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {formData.varnish_type !== 'none' && <div><span className="font-medium">Varnish:</span> {formData.varnish_type}</div>}
            {formData.lamination_type !== 'none' && <div><span className="font-medium">Lamination:</span> {formData.lamination_type}</div>}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Add New Order</h2>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          <div className="mt-6 flex justify-between gap-3">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : handlePrevious}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : currentStep === 5 ? 'Create Order' : 'Next'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              Error creating order
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
