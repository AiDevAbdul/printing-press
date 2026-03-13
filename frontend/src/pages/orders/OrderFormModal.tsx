import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Checkbox } from '../../components/ui/Checkbox';
import { ChevronRight, ChevronLeft, AlertCircle, Plus, Minus } from 'lucide-react';

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
  const [showPantone, setShowPantone] = useState(false);
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
      // Convert arrays to comma-separated strings for backend
      const submitData = {
        ...formData,
        design_file_formats: (formData.design_file_formats || []).join(','),
        proof_type_required: (formData.proof_type_required || []).join(','),
        preferred_machines: (formData.preferred_machines || []).join(','),
      };
      onSubmit(submitData as any);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? "Create New Order" : "Additional Details (Optional)"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-24">
        {/* Step Indicator - Minimalist */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            1
          </div>
          <div className={`flex-1 h-0.5 transition-all ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            2
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-8">
            {/* Customer & Product Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Customer & Product</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Select
                    label="Customer"
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
                  label="Product Type"
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
                  label="Product Name"
                  required
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="e.g., Business Cards"
                />
              </div>
            </div>

            {/* Timeline Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Order Date"
                  type="date"
                  required
                  value={formData.order_date}
                  onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                />
                <Input
                  label="Delivery Date"
                  type="date"
                  required
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                />
              </div>
            </div>

            {/* Quantity & Pricing Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Quantity & Unit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Quantity"
                  type="number"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                />
                <Select
                  label="Unit"
                  options={[
                    { value: 'pieces', label: 'Pieces' },
                    { value: 'boxes', label: 'Boxes' },
                    { value: 'reams', label: 'Reams' },
                    { value: 'kg', label: 'Kg' },
                  ]}
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
            </div>

            {/* Priority Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Priority</h3>
              <Select
                label="Priority Level"
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              />
            </div>

            {/* Specifications Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Specifications</h3>
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
              </div>
            </div>

            {/* Colors Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input
                  label="Cyan (%)"
                  value={formData.color_cyan || ''}
                  onChange={(e) => setFormData({ ...formData, color_cyan: e.target.value })}
                  placeholder="0-100"
                />
                <Input
                  label="Magenta (%)"
                  value={formData.color_magenta || ''}
                  onChange={(e) => setFormData({ ...formData, color_magenta: e.target.value })}
                  placeholder="0-100"
                />
                <Input
                  label="Yellow (%)"
                  value={formData.color_yellow || ''}
                  onChange={(e) => setFormData({ ...formData, color_yellow: e.target.value })}
                  placeholder="0-100"
                />
                <Input
                  label="Black (%)"
                  value={formData.color_black || ''}
                  onChange={(e) => setFormData({ ...formData, color_black: e.target.value })}
                  placeholder="0-100"
                />
              </div>

              {/* Pantone Toggle */}
              <button
                type="button"
                onClick={() => setShowPantone(!showPantone)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
              >
                {showPantone ? <Minus size={16} /> : <Plus size={16} />}
                {showPantone ? 'Hide' : 'Add'} Pantone Colors
              </button>

              {/* Pantone Fields - Hidden by default */}
              {showPantone && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-200">
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
                </div>
              )}
            </div>

            {/* Finishing Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Finishing</h3>

              {/* Varnish - 2 Column Grid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Varnish Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'water_base', label: 'Water Base' },
                    { value: 'duck', label: 'Duck' },
                    { value: 'plain_uv', label: 'Plain UV' },
                    { value: 'spot_uv', label: 'Spot UV' },
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

              {/* Lamination - 2 Column Grid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Lamination Type</label>
                <div className="grid grid-cols-2 gap-3">
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

              {/* Additional Finishing Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                <Input
                  label="Lamination Size"
                  value={formData.lamination_size || ''}
                  onChange={(e) => setFormData({ ...formData, lamination_size: e.target.value })}
                />
                <div className="flex gap-4 items-end">
                  <Checkbox
                    label="Back Printing"
                    checked={formData.has_back_printing || false}
                    onChange={(e) => setFormData({ ...formData, has_back_printing: e.target.checked })}
                  />
                  <Checkbox
                    label="Barcode"
                    checked={formData.has_barcode || false}
                    onChange={(e) => setFormData({ ...formData, has_barcode: e.target.checked })}
                  />
                </div>
              </div>
            </div>

            {/* Product-Specific Fields */}
            {formData.product_type === 'silvo_blister' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Cylinder Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </div>
            )}

            {(formData.product_type === 'bent_foil' || formData.product_type === 'alu_alu') && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Foil Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Design & File Management */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Design & Files</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">File Formats</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'pdf', label: 'PDF' },
                      { value: 'ai', label: 'AI' },
                      { value: 'psd', label: 'PSD' },
                      { value: 'cdr', label: 'CDR' },
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

            {/* Plate & Separation */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Plates & Separation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  label="Plate Size"
                  value={formData.plate_size || ''}
                  onChange={(e) => setFormData({ ...formData, plate_size: e.target.value })}
                  placeholder="e.g., A2, B1"
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
                  label="Plate Reference"
                  value={formData.plate_reference || ''}
                  onChange={(e) => setFormData({ ...formData, plate_reference: e.target.value })}
                />
              </div>
            </div>

            {/* Proofing & QC */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Proofing & QC</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proof Type Required</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'digital_proof', label: 'Digital Proof' },
                      { value: 'physical_proof', label: 'Physical Proof' },
                      { value: 'color_match', label: 'Color Match' },
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

            {/* Production Setup */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Production Setup</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Machines</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'machine_a', label: 'Machine A' },
                      { value: 'machine_b', label: 'Machine B' },
                      { value: 'machine_c', label: 'Machine C' },
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
                <Checkbox
                  label="Special Setup Required"
                  checked={formData.special_setup_required || false}
                  onChange={(e) => setFormData({ ...formData, special_setup_required: e.target.checked })}
                />
                <Input
                  label="Estimated Setup Time (min)"
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
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Additional Notes</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                <textarea
                  value={formData.special_instructions}
                  onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any additional instructions or notes"
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error creating order</p>
              <p className="text-sm text-red-700">Please check all required fields are filled correctly.</p>
            </div>
          </div>
        )}
      </form>

      {/* Order Summary Box - Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-gray-600">Order Total:</span>
            <span className="text-2xl font-bold text-gray-900">${formData.final_price.toFixed(2)}</span>
          </div>
          <div className="flex gap-3">
            <Input
              label="Final Price"
              type="number"
              value={formData.final_price}
              onChange={(e) => setFormData({ ...formData, final_price: Number(e.target.value) })}
              className="w-32"
            />
          </div>
        </div>
      </div>

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
