import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationService, Quotation, CreateQuotationDto, PricingBreakdown } from '../../services/quotation.service';
import { customerService } from '../../services/customer.service';

interface QuotationFormProps {
  quotation?: Quotation | null;
  onClose: () => void;
}

const QuotationForm = ({ quotation, onClose }: QuotationFormProps) => {
  const [formData, setFormData] = useState<Partial<CreateQuotationDto>>({
    quotation_date: new Date().toISOString().split('T')[0], // Keep as YYYY-MM-DD for date input
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    product_type: 'cpp_carton',
    unit: 'pcs',
    color_front: 0,
    color_back: 0,
    varnish_type: 'none',
    lamination_type: 'none',
    profit_margin_percent: 20,
    discount_percent: 0,
    tax_percent: 18,
    pantone_p1: false,
    pantone_p2: false,
    pantone_p3: false,
    pantone_p4: false,
    embossing: false,
    foiling: false,
    die_cutting: false,
    pasting: false,
    ctp_required: false,
    ...quotation,
  });
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const queryClient = useQueryClient();

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: quotationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateQuotationDto> }) =>
      quotationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      onClose();
    },
  });

  const calculatePricingMutation = useMutation({
    mutationFn: quotationService.calculatePricing,
    onSuccess: (data) => {
      setPricing(data);
    },
  });

  useEffect(() => {
    // Auto-calculate pricing when relevant fields change
    if (
      formData.product_type &&
      formData.quantity &&
      formData.length &&
      formData.width &&
      formData.gsm
    ) {
      calculatePricingMutation.mutate(formData as any);
    }
  }, [
    formData.product_type,
    formData.quantity,
    formData.length,
    formData.width,
    formData.gsm,
    formData.color_front,
    formData.color_back,
    formData.varnish_type,
    formData.lamination_type,
    formData.embossing,
    formData.foiling,
    formData.die_cutting,
    formData.pasting,
    formData.profit_margin_percent,
    formData.discount_percent,
    formData.tax_percent,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Properly format data with type coercion
    const submitData: any = {
      ...formData,
      // Convert dates to ISO strings
      quotation_date: formData.quotation_date ? new Date(formData.quotation_date).toISOString() : undefined,
      valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : undefined,
      // Ensure numbers are numbers, not strings
      quantity: formData.quantity ? Number(formData.quantity) : undefined,
      length: formData.length ? Number(formData.length) : undefined,
      width: formData.width ? Number(formData.width) : undefined,
      height: formData.height ? Number(formData.height) : undefined,
      gsm: formData.gsm ? Number(formData.gsm) : undefined,
      color_front: formData.color_front !== undefined ? Number(formData.color_front) : 0,
      color_back: formData.color_back !== undefined ? Number(formData.color_back) : 0,
      cylinder_size: formData.cylinder_size ? Number(formData.cylinder_size) : undefined,
      foil_thickness: formData.foil_thickness ? Number(formData.foil_thickness) : undefined,
      profit_margin_percent: formData.profit_margin_percent !== undefined ? Number(formData.profit_margin_percent) : 20,
      discount_percent: formData.discount_percent !== undefined ? Number(formData.discount_percent) : 0,
      tax_percent: formData.tax_percent !== undefined ? Number(formData.tax_percent) : 18,
      // Ensure booleans are booleans
      pantone_p1: Boolean(formData.pantone_p1),
      pantone_p2: Boolean(formData.pantone_p2),
      pantone_p3: Boolean(formData.pantone_p3),
      pantone_p4: Boolean(formData.pantone_p4),
      embossing: Boolean(formData.embossing),
      foiling: Boolean(formData.foiling),
      die_cutting: Boolean(formData.die_cutting),
      pasting: Boolean(formData.pasting),
      ctp_required: Boolean(formData.ctp_required),
    };

    // Remove undefined values
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === undefined) {
        delete submitData[key];
      }
    });

    if (quotation?.id) {
      await updateMutation.mutateAsync({
        id: quotation.id,
        data: submitData,
      });
    } else {
      await createMutation.mutateAsync(submitData);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const customers = customersData?.data || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {quotation ? 'Edit Quotation' : 'New Quotation'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Basic Info Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer *
                  </label>
                  <select
                    value={formData.customer_id || ''}
                    onChange={(e) => handleChange('customer_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer: any) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quotation Date *
                    </label>
                    <input
                      type="date"
                      value={formData.quotation_date || ''}
                      onChange={(e) => handleChange('quotation_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid Until *
                    </label>
                    <input
                      type="date"
                      value={formData.valid_until || ''}
                      onChange={(e) => handleChange('valid_until', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Product Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.product_name || ''}
                    onChange={(e) => handleChange('product_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type *
                  </label>
                  <select
                    value={formData.product_type || ''}
                    onChange={(e) => handleChange('product_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="cpp_carton">CPP Carton</option>
                    <option value="silvo_blister">Silvo/Blister Foil</option>
                    <option value="bent_foil">Bent Foil</option>
                    <option value="alu_alu">Alu-Alu</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity || ''}
                      onChange={(e) => handleChange('quantity', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <select
                      value={formData.unit || ''}
                      onChange={(e) => handleChange('unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="pcs">Pieces</option>
                      <option value="boxes">Boxes</option>
                      <option value="sheets">Sheets</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Length (mm)
                    </label>
                    <input
                      type="number"
                      value={formData.length || ''}
                      onChange={(e) => handleChange('length', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width (mm)
                    </label>
                    <input
                      type="number"
                      value={formData.width || ''}
                      onChange={(e) => handleChange('width', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height (mm)
                    </label>
                    <input
                      type="number"
                      value={formData.height || ''}
                      onChange={(e) => handleChange('height', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Specifications</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Paper Type
                    </label>
                    <input
                      type="text"
                      value={formData.paper_type || ''}
                      onChange={(e) => handleChange('paper_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GSM
                    </label>
                    <input
                      type="number"
                      value={formData.gsm || ''}
                      onChange={(e) => handleChange('gsm', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Colors Front
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="4"
                      value={formData.color_front || 0}
                      onChange={(e) => handleChange('color_front', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Colors Back
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="4"
                      value={formData.color_back || 0}
                      onChange={(e) => handleChange('color_back', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.pantone_p1 || false}
                      onChange={(e) => handleChange('pantone_p1', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Pantone P1</span>
                    {formData.pantone_p1 && (
                      <input
                        type="text"
                        placeholder="Code"
                        value={formData.pantone_p1_code || ''}
                        onChange={(e) => handleChange('pantone_p1_code', e.target.value)}
                        className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    )}
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.pantone_p2 || false}
                      onChange={(e) => handleChange('pantone_p2', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Pantone P2</span>
                    {formData.pantone_p2 && (
                      <input
                        type="text"
                        placeholder="Code"
                        value={formData.pantone_p2_code || ''}
                        onChange={(e) => handleChange('pantone_p2_code', e.target.value)}
                        className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Finishing Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Finishing Options</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Varnish Type
                    </label>
                    <select
                      value={formData.varnish_type || 'none'}
                      onChange={(e) => handleChange('varnish_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lamination Type
                    </label>
                    <select
                      value={formData.lamination_type || 'none'}
                      onChange={(e) => handleChange('lamination_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">None</option>
                      <option value="shine">Shine</option>
                      <option value="matt">Matt</option>
                      <option value="metalize">Metalize</option>
                      <option value="rainbow">Rainbow</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.embossing || false}
                      onChange={(e) => handleChange('embossing', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Embossing</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.foiling || false}
                      onChange={(e) => handleChange('foiling', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Foiling</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.die_cutting || false}
                      onChange={(e) => handleChange('die_cutting', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Die Cutting</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.pasting || false}
                      onChange={(e) => handleChange('pasting', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Pasting</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.ctp_required || false}
                      onChange={(e) => handleChange('ctp_required', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">CTP Required</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Pricing & Review</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profit Margin (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.profit_margin_percent || 20}
                      onChange={(e) => handleChange('profit_margin_percent', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percent || 0}
                      onChange={(e) => handleChange('discount_percent', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.tax_percent || 18}
                      onChange={(e) => handleChange('tax_percent', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Pricing Breakdown */}
                {pricing && (
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <h3 className="font-semibold mb-3">Pricing Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Material Cost:</span>
                        <span>₹{pricing.material_cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Printing Cost:</span>
                        <span>₹{pricing.printing_cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Finishing Cost:</span>
                        <span>₹{pricing.finishing_cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pre-Press Cost:</span>
                        <span>₹{pricing.pre_press_cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overhead (15%):</span>
                        <span>₹{pricing.overhead_cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Subtotal:</span>
                        <span>₹{pricing.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profit Margin ({pricing.profit_margin_percent}%):</span>
                        <span>₹{pricing.profit_margin_amount.toLocaleString()}</span>
                      </div>
                      {pricing.discount_percent > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Discount ({pricing.discount_percent}%):</span>
                          <span>-₹{pricing.discount_amount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Tax ({pricing.tax_percent}%):</span>
                        <span>₹{pricing.tax_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total Amount:</span>
                        <span>₹{pricing.total_amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : quotation
                ? 'Update Quotation'
                : 'Create Quotation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuotationForm;
