import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Checkbox } from '../../components/ui/Checkbox';
import { ChevronRight, ChevronLeft } from 'lucide-react';

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
  varnish_type?: string[];
  varnish_details?: string;
  lamination_type?: string[];
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
  // Design & File Management
  design_file_status?: string;
  design_file_formats?: string[];
  design_approval_date?: string;
  design_revisions_count?: number;
  design_notes?: string;
  // Plate & Separation Details
  color_separation_type?: string;
  number_of_plates?: number;
  plate_size?: string;
  plate_material?: string;
  plate_condition?: string;
  plate_approval_status?: string;
  plate_approval_date?: string;
  // Proofing & Quality Control
  proof_type_required?: string[];
  proof_status?: string;
  proof_approval_date?: string;
  color_matching_standard?: string;
  quality_check_notes?: string;
  approved_by?: string;
  // Production Setup & Machine Requirements
  preferred_machines?: string[];
  special_setup_required?: boolean;
  setup_instructions?: string;
  estimated_setup_time?: number;
  machine_calibration_notes?: string;
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
  const [step, setStep] = useState<1 | 2>(1);
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
    varnish_type: [],
    lamination_type: [],
    design_file_status: 'not_received',
    design_file_formats: [],
    design_revisions_count: 0,
    color_separation_type: 'cmyk',
    number_of_plates: 4,
    plate_condition: 'new',
    plate_approval_status: 'pending',
    proof_type_required: [],
    proof_status: 'not_required',
    color_matching_standard: 'none',
    preferred_machines: [],
    special_setup_required: false,
    estimated_setup_time: 0,
  });

  const validateStep1 = () => {
    if (!formData.customer_id) {
      toast.error('Please select a customer');
      return false;
    }
    if (!formData.order_date) {
      toast.error('Please select an order date');
      return false;
    }
    if (!formData.delivery_date) {
      toast.error('Please select a delivery date');
      return false;
    }
    if (!formData.product_name) {
      toast.error('Please enter a product name');
      return false;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      onSubmit(formData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? "Add New Order - Step 1: Order Details" : "Add New Order - Step 2: Pre-Press Details (Optional)"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            1
          </div>
          <div className={`flex-1 h-1 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            2
          </div>
        </div>

        {step === 1 ? (
          <>
            {/* STEP 1: Order Details */}
            {/* Basic Info Section */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Basic Information
              </h3>
              <p className="text-sm text-gray-600 mb-4">Essential order details and customer information</p>
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
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <span className="text-2xl">📐</span>
                Specifications
              </h3>
              <p className="text-sm text-gray-600 mb-4">Product dimensions, materials, and color details</p>
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
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <span className="text-2xl">✨</span>
                Finishing Options
              </h3>
              <p className="text-sm text-gray-600 mb-4">Varnish, lamination, and special finishing effects</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Varnish Type</label>
                  <div className="space-y-2">
                    {[
                      { value: 'water_base', label: 'Water Base' },
                      { value: 'duck', label: 'Duck' },
                      { value: 'plain_uv', label: 'Plain UV' },
                      { value: 'spot_uv', label: 'Spot UV' },
                      { value: 'drip_off_uv', label: 'Drip Off UV' },
                      { value: 'matt_uv', label: 'Matt UV' },
                      { value: 'rough_uv', label: 'Rough UV' },
                    ].map((option) => (
                      <Checkbox
                        key={option.value}
                        label={option.label}
                        checked={(formData.varnish_type || []).includes(option.value)}
                        onChange={(e) => {
                          const current = formData.varnish_type || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, varnish_type: [...current, option.value] });
                          } else {
                            setFormData({ ...formData, varnish_type: current.filter(v => v !== option.value) });
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Lamination Type</label>
                  <div className="space-y-2">
                    {[
                      { value: 'shine', label: 'Shine' },
                      { value: 'matt', label: 'Matt' },
                      { value: 'metalize', label: 'Metalize' },
                      { value: 'rainbow', label: 'Rainbow' },
                    ].map((option) => (
                      <Checkbox
                        key={option.value}
                        label={option.label}
                        checked={(formData.lamination_type || []).includes(option.value)}
                        onChange={(e) => {
                          const current = formData.lamination_type || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, lamination_type: [...current, option.value] });
                          } else {
                            setFormData({ ...formData, lamination_type: current.filter(v => v !== option.value) });
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>

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
          </>
        ) : (
          <>
            {/* STEP 2: Pre-Press Details (Optional) */}
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <span className="text-2xl">🎨</span>
            Pre-Press Details
          </h3>
          <p className="text-sm text-gray-600 mb-4">Design, plates, dies, and production setup information</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Design & File Management Subsection */}
            <div className="md:col-span-2 bg-white p-3 rounded-lg border border-orange-200">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>📁</span>
                Design & File Management
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select
                  label="Design File Status"
                  options={[
                    { value: 'not_received', label: 'Not Received' },
                    { value: 'received', label: 'Received' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
                    { value: 'revision_needed', label: 'Revision Needed' },
                  ]}
                  value={formData.design_file_status || 'not_received'}
                  onChange={(e) => setFormData({ ...formData, design_file_status: e.target.value })}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Design File Formats</label>
                  <div className="space-y-2">
                    {[
                      { value: 'pdf', label: 'PDF' },
                      { value: 'ai', label: 'AI' },
                      { value: 'psd', label: 'PSD' },
                      { value: 'cdr', label: 'CDR' },
                      { value: 'eps', label: 'EPS' },
                      { value: 'jpg', label: 'JPG' },
                      { value: 'png', label: 'PNG' },
                    ].map((option) => (
                      <Checkbox
                        key={option.value}
                        label={option.label}
                        checked={(formData.design_file_formats || []).includes(option.value)}
                        onChange={(e) => {
                          const current = formData.design_file_formats || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, design_file_formats: [...current, option.value] });
                          } else {
                            setFormData({ ...formData, design_file_formats: current.filter(v => v !== option.value) });
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>

                <Input
                  label="Design Approval Date"
                  type="date"
                  value={formData.design_approval_date || ''}
                  onChange={(e) => setFormData({ ...formData, design_approval_date: e.target.value })}
                />

                <Input
                  label="Design Revisions Count"
                  type="number"
                  value={formData.design_revisions_count || 0}
                  onChange={(e) => setFormData({ ...formData, design_revisions_count: Number(e.target.value) })}
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Design Notes</label>
                  <textarea
                    value={formData.design_notes || ''}
                    onChange={(e) => setFormData({ ...formData, design_notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Feedback, changes needed, etc."
                  />
                </div>
              </div>
            </div>

            {/* Plate & Separation Details Subsection */}
            <div className="md:col-span-2 bg-white p-3 rounded-lg border border-orange-200">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>🖨️</span>
                Plate & Separation Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select
                  label="Color Separation Type"
                  options={[
                    { value: 'cmyk', label: 'CMYK' },
                    { value: 'spot_colors', label: 'Spot Colors' },
                    { value: 'rgb', label: 'RGB' },
                    { value: 'pantone', label: 'Pantone' },
                  ]}
                  value={formData.color_separation_type || 'cmyk'}
                  onChange={(e) => setFormData({ ...formData, color_separation_type: e.target.value })}
                />

                <Input
                  label="Number of Plates"
                  type="number"
                  value={formData.number_of_plates || 4}
                  onChange={(e) => setFormData({ ...formData, number_of_plates: Number(e.target.value) })}
                />

                <Input
                  label="Plate Size (e.g., A2, B1)"
                  value={formData.plate_size || ''}
                  onChange={(e) => setFormData({ ...formData, plate_size: e.target.value })}
                />

                <Select
                  label="Plate Material"
                  options={[
                    { value: '', label: 'Select Material' },
                    { value: 'aluminum', label: 'Aluminum' },
                    { value: 'polyester', label: 'Polyester' },
                    { value: 'steel', label: 'Steel' },
                  ]}
                  value={formData.plate_material || ''}
                  onChange={(e) => setFormData({ ...formData, plate_material: e.target.value })}
                />

                <Select
                  label="Plate Condition"
                  options={[
                    { value: '', label: 'Select Condition' },
                    { value: 'new', label: 'New' },
                    { value: 'reused', label: 'Reused' },
                    { value: 'refurbished', label: 'Refurbished' },
                  ]}
                  value={formData.plate_condition || ''}
                  onChange={(e) => setFormData({ ...formData, plate_condition: e.target.value })}
                />

                <Select
                  label="Plate Approval Status"
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
                  ]}
                  value={formData.plate_approval_status || 'pending'}
                  onChange={(e) => setFormData({ ...formData, plate_approval_status: e.target.value })}
                />

                <Input
                  label="Plate Approval Date"
                  type="date"
                  value={formData.plate_approval_date || ''}
                  onChange={(e) => setFormData({ ...formData, plate_approval_date: e.target.value })}
                />
              </div>
            </div>

            {/* Proofing & Quality Control Subsection */}
            <div className="md:col-span-2 bg-white p-3 rounded-lg border border-orange-200">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>✅</span>
                Proofing & Quality Control
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proof Type Required</label>
                  <div className="space-y-2">
                    {[
                      { value: 'digital_proof', label: 'Digital Proof' },
                      { value: 'physical_proof', label: 'Physical Proof' },
                      { value: 'color_match', label: 'Color Match' },
                      { value: 'none', label: 'None' },
                    ].map((option) => (
                      <Checkbox
                        key={option.value}
                        label={option.label}
                        checked={(formData.proof_type_required || []).includes(option.value)}
                        onChange={(e) => {
                          const current = formData.proof_type_required || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, proof_type_required: [...current, option.value] });
                          } else {
                            setFormData({ ...formData, proof_type_required: current.filter(v => v !== option.value) });
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>

                <Select
                  label="Proof Status"
                  options={[
                    { value: 'not_required', label: 'Not Required' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'sent', label: 'Sent' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
                  ]}
                  value={formData.proof_status || 'not_required'}
                  onChange={(e) => setFormData({ ...formData, proof_status: e.target.value })}
                />

                <Input
                  label="Proof Approval Date"
                  type="date"
                  value={formData.proof_approval_date || ''}
                  onChange={(e) => setFormData({ ...formData, proof_approval_date: e.target.value })}
                />

                <Select
                  label="Color Matching Standard"
                  options={[
                    { value: 'pantone', label: 'Pantone' },
                    { value: 'cmyk', label: 'CMYK' },
                    { value: 'custom', label: 'Custom' },
                    { value: 'none', label: 'None' },
                  ]}
                  value={formData.color_matching_standard || 'none'}
                  onChange={(e) => setFormData({ ...formData, color_matching_standard: e.target.value })}
                />

                <Input
                  label="Approved By"
                  value={formData.approved_by || ''}
                  onChange={(e) => setFormData({ ...formData, approved_by: e.target.value })}
                  placeholder="Name or ID"
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quality Check Notes</label>
                  <textarea
                    value={formData.quality_check_notes || ''}
                    onChange={(e) => setFormData({ ...formData, quality_check_notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Quality observations and notes"
                  />
                </div>
              </div>
            </div>

            {/* Production Setup & Machine Requirements Subsection */}
            <div className="md:col-span-2 bg-white p-3 rounded-lg border border-orange-200">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>⚙️</span>
                Production Setup & Machine Requirements
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Machine/Equipment</label>
                  <div className="space-y-2">
                    {[
                      { value: 'machine_a', label: 'Machine A' },
                      { value: 'machine_b', label: 'Machine B' },
                      { value: 'machine_c', label: 'Machine C' },
                      { value: 'machine_d', label: 'Machine D' },
                    ].map((option) => (
                      <Checkbox
                        key={option.value}
                        label={option.label}
                        checked={(formData.preferred_machines || []).includes(option.value)}
                        onChange={(e) => {
                          const current = formData.preferred_machines || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, preferred_machines: [...current, option.value] });
                          } else {
                            setFormData({ ...formData, preferred_machines: current.filter(v => v !== option.value) });
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Checkbox
                    label="Special Setup Required"
                    checked={formData.special_setup_required || false}
                    onChange={(e) => setFormData({ ...formData, special_setup_required: e.target.checked })}
                  />
                </div>

                <Input
                  label="Estimated Setup Time (minutes)"
                  type="number"
                  value={formData.estimated_setup_time || 0}
                  onChange={(e) => setFormData({ ...formData, estimated_setup_time: Number(e.target.value) })}
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Setup Instructions</label>
                  <textarea
                    value={formData.setup_instructions || ''}
                    onChange={(e) => setFormData({ ...formData, setup_instructions: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Detailed setup notes for production team"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Machine Calibration Notes</label>
                  <textarea
                    value={formData.machine_calibration_notes || ''}
                    onChange={(e) => setFormData({ ...formData, machine_calibration_notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Calibration requirements and specifications"
                  />
                </div>
              </div>
            </div>

            {/* Original Pre-Press Fields */}
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
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-red-800">Error creating order</p>
              <p className="text-sm text-red-700">Please check all required fields are filled correctly.</p>
            </div>
          </div>
        )}
      </form>

      {/* Footer Actions */}
      <div className="flex gap-3 justify-between pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
        >
          Cancel
        </Button>

        <div className="flex gap-3">
          {step === 2 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Back
            </Button>
          )}

          {step === 1 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Creating...' : 'Create Order'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
