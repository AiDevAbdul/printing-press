import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { quotationService, Quotation, CreateQuotationDto, PricingBreakdown } from '../../services/quotation.service';
import { customerService } from '../../services/customer.service';
import {
  PRODUCT_TYPES,
  PAPER_TYPES_BY_PRODUCT,
  GSM_OPTIONS,
  UNIT_OPTIONS,
  DOUBLE_SHEET_OPTIONS,
  DYE_REQ_OPTIONS,
  BAR_CODE_OPTIONS,
  VARNISH_OPTIONS,
  LAMINATION_OPTIONS,
  isCardProduct,
  isPaperProduct,
} from '../../constants/quotation.constants';

interface QuotationFormProps {
  quotation?: Quotation | null;
  onClose: () => void;
}

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

// Pricing fields that trigger calculations (O(1) lookup with Set)
const PRICING_FIELDS = new Set([
  'product_type', 'quantity', 'length', 'width', 'gsm',
  'color_front', 'color_back', 'varnish_type', 'lamination_type',
  'embossing', 'foiling', 'die_cutting', 'pasting',
  'profit_margin_percent', 'discount_percent', 'tax_percent',
  'ups', 'price_per_kg_card', 'price_per_kg_paper',
  'conversion_percent_card', 'conversion_percent_paper'
]);

const isPricingField = (fieldName: string): boolean => PRICING_FIELDS.has(fieldName);

// Fixed charges configuration for data-driven rendering
const FIXED_CHARGES = [
  { key: 'fixed_charge_ctp', label: 'CTP' },
  { key: 'fixed_charge_spot_uv', label: 'Spot UV' },
  { key: 'fixed_charge_plain_uv', label: 'Plain UV' },
  { key: 'fixed_charge_drip_off_uv', label: 'Drip Off UV' },
  { key: 'fixed_charge_metalize', label: 'Metalize' },
  { key: 'fixed_charge_emboss', label: 'Emboss' },
  { key: 'fixed_charge_lamination', label: 'Lamination' },
  { key: 'fixed_charge_others', label: 'Others' },
];

const QuotationForm = ({ quotation, onClose }: QuotationFormProps) => {
  // Pricing-related fields (triggers calculations)
  const [pricingFormData, setPricingFormData] = useState<Partial<CreateQuotationDto>>({
    product_type: quotation?.product_type || 'cpp_carton',
    quantity: quotation?.quantity,
    length: quotation?.length,
    width: quotation?.width,
    gsm: quotation?.gsm,
    color_front: quotation?.color_front || 0,
    color_back: quotation?.color_back || 0,
    varnish_type: quotation?.varnish_type || 'none',
    lamination_type: quotation?.lamination_type || 'none',
    embossing: quotation?.embossing || false,
    foiling: quotation?.foiling || false,
    die_cutting: quotation?.die_cutting || false,
    pasting: quotation?.pasting || false,
    profit_margin_percent: quotation?.profit_margin_percent || 20,
    discount_percent: quotation?.discount_percent || 0,
    tax_percent: quotation?.tax_percent || 18,
    ups: quotation?.ups,
    price_per_kg_card: quotation?.price_per_kg_card,
    price_per_kg_paper: quotation?.price_per_kg_paper,
    conversion_percent_card: quotation?.conversion_percent_card,
    conversion_percent_paper: quotation?.conversion_percent_paper,
  });

  // Non-pricing fields (doesn't trigger calculations)
  const [otherFormData, setOtherFormData] = useState<Partial<CreateQuotationDto>>({
    quotation_date: quotation?.quotation_date || new Date().toISOString().split('T')[0],
    valid_until: quotation?.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customer_id: quotation?.customer_id,
    product_name: quotation?.product_name,
    paper_type: quotation?.paper_type,
    unit: quotation?.unit || 'kg',
    double_sheet: quotation?.double_sheet,
    bar_code: quotation?.bar_code,
    dye_req: quotation?.dye_req,
    batch_no: quotation?.batch_no,
    mfg_date: quotation?.mfg_date,
    exp_date: quotation?.exp_date,
    mrp_rs: quotation?.mrp_rs,
    height: quotation?.height,
    cylinder_size: quotation?.cylinder_size,
    foil_thickness: quotation?.foil_thickness,
    four_color_process: quotation?.four_color_process || false,
    inside_printing: quotation?.inside_printing || false,
    cmyk_cyan: quotation?.cmyk_cyan || false,
    cmyk_magenta: quotation?.cmyk_magenta || false,
    cmyk_yellow: quotation?.cmyk_yellow || false,
    cmyk_black: quotation?.cmyk_black || false,
    pantone_p1: quotation?.pantone_p1 || false,
    pantone_p2: quotation?.pantone_p2 || false,
    pantone_p3: quotation?.pantone_p3 || false,
    pantone_p4: quotation?.pantone_p4 || false,
    pantone_p1_code: quotation?.pantone_p1_code,
    pantone_p2_code: quotation?.pantone_p2_code,
    pantone_p3_code: quotation?.pantone_p3_code,
    pantone_p4_code: quotation?.pantone_p4_code,
    bleach_card: quotation?.bleach_card || false,
    box_board_card: quotation?.box_board_card || false,
    art_card: quotation?.art_card || false,
    embossing_details: quotation?.embossing_details,
    foiling_details: quotation?.foiling_details,
    die_cutting_details: quotation?.die_cutting_details,
    pasting_details: quotation?.pasting_details,
    fixed_charge_ctp: quotation?.fixed_charge_ctp || 0,
    fixed_charge_spot_uv: quotation?.fixed_charge_spot_uv || 0,
    fixed_charge_plain_uv: quotation?.fixed_charge_plain_uv || 0,
    fixed_charge_drip_off_uv: quotation?.fixed_charge_drip_off_uv || 0,
    fixed_charge_metalize: quotation?.fixed_charge_metalize || 0,
    fixed_charge_emboss: quotation?.fixed_charge_emboss || 0,
    fixed_charge_lamination: quotation?.fixed_charge_lamination || 0,
    fixed_charge_others: quotation?.fixed_charge_others || 0,
    notes: quotation?.notes,
  });

  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    batchPrinting: false,
    fixedCharges: false,
  });

  const queryClient = useQueryClient();

  const { data: customersData, isLoading: customersLoading, isError: customersError } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: quotationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      onClose();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to create quotation';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateQuotationDto> }) =>
      quotationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      onClose();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update quotation';
      toast.error(msg);
    },
  });

  const calculatePricingMutation = useMutation({
    mutationFn: quotationService.calculatePricing,
    onSuccess: (data) => {
      setPricing(data);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to calculate pricing';
      toast.error(msg);
    },
  });

  // Remove useEffect - no more real-time calculation
  // Users will click "Calculate Pricing" button instead

  const handleChange = useCallback((field: string, value: any) => {
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (isPricingField(field)) {
      setPricingFormData((prev) => ({ ...prev, [field]: value }));
    } else {
      setOtherFormData((prev) => ({ ...prev, [field]: value }));
    }
  }, [errors]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // Manual pricing calculation function
  const handleCalculatePricing = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!pricingFormData.product_type) newErrors.product_type = 'Product type is required';
    if (!pricingFormData.quantity) newErrors.quantity = 'Quantity is required';
    if (!pricingFormData.length) newErrors.length = 'Length is required';
    if (!pricingFormData.width) newErrors.width = 'Width is required';
    if (!pricingFormData.gsm) newErrors.gsm = 'GSM is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Single-pass filter: build clean object without undefined values
    const cleanData: any = {};
    const mergedData = { ...otherFormData, ...pricingFormData };

    Object.entries(mergedData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanData[key] = value;
      }
    });

    calculatePricingMutation.mutate(cleanData);
  }, [pricingFormData, otherFormData, calculatePricingMutation]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!otherFormData.customer_id) newErrors.customer_id = 'Customer is required';
    if (!otherFormData.quotation_date) newErrors.quotation_date = 'Quotation date is required';
    if (!otherFormData.valid_until) newErrors.valid_until = 'Valid until date is required';
    if (!otherFormData.product_name) newErrors.product_name = 'Product name is required';
    if (!pricingFormData.product_type) newErrors.product_type = 'Product type is required';
    if (!pricingFormData.quantity) newErrors.quantity = 'Quantity is required';
    if (!pricingFormData.length) newErrors.length = 'Length is required';
    if (!pricingFormData.width) newErrors.width = 'Width is required';
    if (!pricingFormData.gsm) newErrors.gsm = 'GSM is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [otherFormData, pricingFormData]);

  // Helper to get value from correct state
  const getFormValue = (field: string) => {
    if (isPricingField(field)) {
      return (pricingFormData as any)[field];
    }
    return (otherFormData as any)[field];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Errors already set in state
    }

    // Merge both form data objects
    const mergedFormData = { ...otherFormData, ...pricingFormData };

    const submitData: any = {
      ...mergedFormData,
      quotation_date: mergedFormData.quotation_date ? new Date(mergedFormData.quotation_date).toISOString() : undefined,
      valid_until: mergedFormData.valid_until ? new Date(mergedFormData.valid_until).toISOString() : undefined,
      mfg_date: mergedFormData.mfg_date ? new Date(mergedFormData.mfg_date).toISOString() : undefined,
      exp_date: mergedFormData.exp_date ? new Date(mergedFormData.exp_date).toISOString() : undefined,
      quantity: mergedFormData.quantity ? Number(mergedFormData.quantity) : undefined,
      length: mergedFormData.length ? Number(mergedFormData.length) : undefined,
      width: mergedFormData.width ? Number(mergedFormData.width) : undefined,
      height: mergedFormData.height ? Number(mergedFormData.height) : undefined,
      gsm: mergedFormData.gsm ? Number(mergedFormData.gsm) : undefined,
      color_front: mergedFormData.color_front !== undefined ? Number(mergedFormData.color_front) : 0,
      color_back: mergedFormData.color_back !== undefined ? Number(mergedFormData.color_back) : 0,
      cylinder_size: mergedFormData.cylinder_size ? Number(mergedFormData.cylinder_size) : undefined,
      foil_thickness: mergedFormData.foil_thickness ? Number(mergedFormData.foil_thickness) : undefined,
      mrp_rs: mergedFormData.mrp_rs ? Number(mergedFormData.mrp_rs) : undefined,
      ups: mergedFormData.ups ? Number(mergedFormData.ups) : undefined,
      price_per_kg_card: mergedFormData.price_per_kg_card ? Number(mergedFormData.price_per_kg_card) : undefined,
      price_per_kg_paper: mergedFormData.price_per_kg_paper ? Number(mergedFormData.price_per_kg_paper) : undefined,
      conversion_percent_card: mergedFormData.conversion_percent_card ? Number(mergedFormData.conversion_percent_card) : undefined,
      conversion_percent_paper: mergedFormData.conversion_percent_paper ? Number(mergedFormData.conversion_percent_paper) : undefined,
      profit_margin_percent: mergedFormData.profit_margin_percent !== undefined ? Number(mergedFormData.profit_margin_percent) : 20,
      discount_percent: mergedFormData.discount_percent !== undefined ? Number(mergedFormData.discount_percent) : 0,
      tax_percent: mergedFormData.tax_percent !== undefined ? Number(mergedFormData.tax_percent) : 18,
      fixed_charge_ctp: mergedFormData.fixed_charge_ctp ? Number(mergedFormData.fixed_charge_ctp) : 0,
      fixed_charge_spot_uv: mergedFormData.fixed_charge_spot_uv ? Number(mergedFormData.fixed_charge_spot_uv) : 0,
      fixed_charge_plain_uv: mergedFormData.fixed_charge_plain_uv ? Number(mergedFormData.fixed_charge_plain_uv) : 0,
      fixed_charge_drip_off_uv: mergedFormData.fixed_charge_drip_off_uv ? Number(mergedFormData.fixed_charge_drip_off_uv) : 0,
      fixed_charge_metalize: mergedFormData.fixed_charge_metalize ? Number(mergedFormData.fixed_charge_metalize) : 0,
      fixed_charge_emboss: mergedFormData.fixed_charge_emboss ? Number(mergedFormData.fixed_charge_emboss) : 0,
      fixed_charge_lamination: mergedFormData.fixed_charge_lamination ? Number(mergedFormData.fixed_charge_lamination) : 0,
      fixed_charge_others: mergedFormData.fixed_charge_others ? Number(mergedFormData.fixed_charge_others) : 0,
      pantone_p1: Boolean(mergedFormData.pantone_p1),
      pantone_p2: Boolean(mergedFormData.pantone_p2),
      pantone_p3: Boolean(mergedFormData.pantone_p3),
      pantone_p4: Boolean(mergedFormData.pantone_p4),
      embossing: Boolean(mergedFormData.embossing),
      foiling: Boolean(mergedFormData.foiling),
      die_cutting: Boolean(mergedFormData.die_cutting),
      pasting: Boolean(mergedFormData.pasting),
      ctp_required: Boolean(mergedFormData.ctp_required),
      four_color_process: Boolean(mergedFormData.four_color_process),
      inside_printing: Boolean(mergedFormData.inside_printing),
      cmyk_cyan: Boolean(mergedFormData.cmyk_cyan),
      cmyk_magenta: Boolean(mergedFormData.cmyk_magenta),
      cmyk_yellow: Boolean(mergedFormData.cmyk_yellow),
      cmyk_black: Boolean(mergedFormData.cmyk_black),
      bleach_card: Boolean(mergedFormData.bleach_card),
      box_board_card: Boolean(mergedFormData.box_board_card),
      art_card: Boolean(mergedFormData.art_card),
    };

    Object.keys(submitData).forEach(key => {
      if (submitData[key] === undefined) {
        delete submitData[key];
      }
    });

    try {
      if (quotation?.id) {
        await updateMutation.mutateAsync({
          id: quotation.id,
          data: submitData,
        });
      } else {
        await createMutation.mutateAsync(submitData);
      }
    } catch (error) {
      // Error already handled by mutation onError
    }
  };

  const CollapsibleSection = ({ title, isOpen, onToggle, children }: CollapsibleSectionProps) => (
    <div className="border border-gray-200 rounded">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 font-medium text-gray-900"
      >
        <span>{title}</span>
        <span className="text-lg">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );

  const customers = customersData?.data || [];
  const availablePaperTypes = useMemo(
    () => PAPER_TYPES_BY_PRODUCT[pricingFormData.product_type as string] || [],
    [pricingFormData.product_type]
  );
  const isCard = useMemo(
    () => isCardProduct(pricingFormData.product_type as string),
    [pricingFormData.product_type]
  );
  const isPaper = useMemo(
    () => isPaperProduct(pricingFormData.product_type as string),
    [pricingFormData.product_type]
  );

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
                  {customersLoading ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500">
                      Loading customers...
                    </div>
                  ) : customersError ? (
                    <div className="w-full px-3 py-2 border border-red-300 rounded bg-red-50 text-red-600">
                      Failed to load customers
                    </div>
                  ) : (
                    <select
                      value={getFormValue("customer_id") || ''}
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
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quotation Date *
                    </label>
                    <input
                      type="date"
                      value={getFormValue("quotation_date") || ''}
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
                      value={getFormValue("valid_until") || ''}
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
                    value={getFormValue("product_name") || ''}
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
                    value={getFormValue("product_type") || ''}
                    onChange={(e) => handleChange('product_type', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                      errors.product_type ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  >
                    <option value="">Select Product Type</option>
                    {PRODUCT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.product_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.product_type}</p>
                  )}
                </div>

                {availablePaperTypes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Paper Type
                    </label>
                    <select
                      value={getFormValue("paper_type") || ''}
                      onChange={(e) => handleChange('paper_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Paper Type</option>
                      {availablePaperTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={getFormValue("quantity") || ''}
                      onChange={(e) => handleChange('quantity', Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                        errors.quantity ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      required
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <select
                      value={getFormValue("unit") || ''}
                      onChange={(e) => handleChange('unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {UNIT_OPTIONS.map((unit) => (
                        <option key={unit} value={unit.toLowerCase()}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {getFormValue("product_type") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Double Sheet
                    </label>
                    <select
                      value={getFormValue("double_sheet") || ''}
                      onChange={(e) => handleChange('double_sheet', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Double Sheet</option>
                      {DOUBLE_SHEET_OPTIONS.map((option) => (
                        <option key={option} value={option.toLowerCase()}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Length(Grain) (mm)
                    </label>
                    <input
                      type="number"
                      value={getFormValue("length") || ''}
                      onChange={(e) => handleChange('length', Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                        errors.length ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.length && (
                      <p className="mt-1 text-sm text-red-600">{errors.length}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width (mm)
                    </label>
                    <input
                      type="number"
                      value={getFormValue("width") || ''}
                      onChange={(e) => handleChange('width', Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                        errors.width ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.width && (
                      <p className="mt-1 text-sm text-red-600">{errors.width}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height (mm)
                    </label>
                    <input
                      type="number"
                      value={getFormValue("height") || ''}
                      onChange={(e) => handleChange('height', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GSM
                    </label>
                    <select
                      value={getFormValue("gsm") || ''}
                      onChange={(e) => handleChange('gsm', Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                        errors.gsm ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    >
                      <option value="">Select GSM</option>
                      {GSM_OPTIONS.map((gsm) => (
                        <option key={gsm} value={gsm}>
                          {gsm}
                        </option>
                      ))}
                    </select>
                    {errors.gsm && (
                      <p className="mt-1 text-sm text-red-600">{errors.gsm}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bar Code
                    </label>
                    <select
                      value={getFormValue("bar_code") || ''}
                      onChange={(e) => handleChange('bar_code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      {BAR_CODE_OPTIONS.map((option) => (
                        <option key={option} value={option.toLowerCase()}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dye Req
                    </label>
                    <select
                      value={getFormValue("dye_req") || ''}
                      onChange={(e) => handleChange('dye_req', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      {DYE_REQ_OPTIONS.map((option) => (
                        <option key={option} value={option.toLowerCase()}>
                          {option}
                        </option>
                      ))}
                    </select>
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
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={getFormValue("four_color_process") || false}
                        onChange={(e) => handleChange('four_color_process', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">4 Color Process</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={getFormValue("inside_printing") || false}
                        onChange={(e) => handleChange('inside_printing', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Inside Printing</span>
                    </label>
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
                      value={getFormValue("color_front") || 0}
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
                      value={getFormValue("color_back") || 0}
                      onChange={(e) => handleChange('color_back', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* CMYK Special Section */}
                <div className="border border-gray-200 rounded p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-3">CMYK Special</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={getFormValue("cmyk_cyan") || false}
                        onChange={(e) => handleChange('cmyk_cyan', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Cyan</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={getFormValue("cmyk_magenta") || false}
                        onChange={(e) => handleChange('cmyk_magenta', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Magenta</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={getFormValue("cmyk_yellow") || false}
                        onChange={(e) => handleChange('cmyk_yellow', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Yellow</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={getFormValue("cmyk_black") || false}
                        onChange={(e) => handleChange('cmyk_black', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Black</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num}>
                        <label className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={getFormValue(`pantone_p${num}`) || false}
                            onChange={(e) => handleChange(`pantone_p${num}`, e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium">Pantone {num}</span>
                        </label>
                        {getFormValue(`pantone_p${num}`) && (
                          <input
                            type="text"
                            placeholder="Pantone Code"
                            value={(getFormValue(`pantone_p${num}_code`) as string) || ''}
                            onChange={(e) => handleChange(`pantone_p${num}_code`, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>
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
                      Coating
                    </label>
                    <select
                      value={getFormValue("varnish_type") || 'none'}
                      onChange={(e) => handleChange('varnish_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {VARNISH_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lamination Type
                    </label>
                    <select
                      value={getFormValue("lamination_type") || 'none'}
                      onChange={(e) => handleChange('lamination_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {LAMINATION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={getFormValue("embossing") || false}
                      onChange={(e) => handleChange('embossing', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Embossing</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={getFormValue("foiling") || false}
                      onChange={(e) => handleChange('foiling', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Gold Leaf Panny</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={getFormValue("die_cutting") || false}
                      onChange={(e) => handleChange('die_cutting', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Die Cutting</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={getFormValue("pasting") || false}
                      onChange={(e) => handleChange('pasting', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Pasting</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={getFormValue("ctp_required") || false}
                      onChange={(e) => handleChange('ctp_required', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">CTP Required</span>
                  </label>
                </div>

                {/* Finishing Details Section */}
                <div className="border-t pt-4 space-y-4">
                  {getFormValue("embossing") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Embossing Details
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Pattern, depth, location"
                        value={getFormValue("embossing_details") || ''}
                        onChange={(e) => handleChange('embossing_details', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {getFormValue("foiling") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Foiling Details
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Gold, silver, color"
                        value={getFormValue("foiling_details") || ''}
                        onChange={(e) => handleChange('foiling_details', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {getFormValue("die_cutting") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Die Cutting Details
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Shape, size, pattern"
                        value={getFormValue("die_cutting_details") || ''}
                        onChange={(e) => handleChange('die_cutting_details', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {getFormValue("pasting") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pasting Details
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Type, location, pattern"
                        value={getFormValue("pasting_details") || ''}
                        onChange={(e) => handleChange('pasting_details', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Card Type Checkboxes */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Card Type</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={getFormValue("bleach_card") || false}
                        onChange={(e) => handleChange('bleach_card', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Bleach Card</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={getFormValue("box_board_card") || false}
                        onChange={(e) => handleChange('box_board_card', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Box Board Card</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={getFormValue("art_card") || false}
                        onChange={(e) => handleChange('art_card', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Art Card</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Batch No Printing Section */}
            <CollapsibleSection
              title="Batch No Printing"
              isOpen={expandedSections.batchPrinting}
              onToggle={() => toggleSection('batchPrinting')}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch No
                  </label>
                  <input
                    type="text"
                    value={getFormValue("batch_no") || ''}
                    onChange={(e) => handleChange('batch_no', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MFG Date
                  </label>
                  <input
                    type="date"
                    value={getFormValue("mfg_date") || ''}
                    onChange={(e) => handleChange('mfg_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    EXP Date
                  </label>
                  <input
                    type="date"
                    value={getFormValue("exp_date") || ''}
                    onChange={(e) => handleChange('exp_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MRP Rs.
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={getFormValue("mrp_rs") || ''}
                    onChange={(e) => handleChange('mrp_rs', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Cost Calculation Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Cost Calculation</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UPS
                    </label>
                    <input
                      type="number"
                      value={getFormValue("ups") || ''}
                      onChange={(e) => handleChange('ups', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conversion %
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="100"
                      value={isCard ? getFormValue("conversion_percent_card") || '' : getFormValue("conversion_percent_paper") || ''}
                      onChange={(e) =>
                        isCard
                          ? handleChange('conversion_percent_card', Number(e.target.value))
                          : handleChange('conversion_percent_paper', Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {isCard && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per KG (Card)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={getFormValue("price_per_kg_card") || ''}
                      onChange={(e) => handleChange('price_per_kg_card', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {isPaper && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per KG (Paper)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={getFormValue("price_per_kg_paper") || ''}
                      onChange={(e) => handleChange('price_per_kg_paper', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Calculate Pricing Button */}
                <button
                  type="button"
                  onClick={handleCalculatePricing}
                  disabled={calculatePricingMutation.isPending}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {calculatePricingMutation.isPending ? 'Calculating...' : 'Calculate Pricing'}
                </button>

                {/* Fixed Charges Section */}
                <CollapsibleSection
                  title="Fixed Charges"
                  isOpen={expandedSections.fixedCharges}
                  onToggle={() => toggleSection('fixedCharges')}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {FIXED_CHARGES.map(charge => (
                      <div key={charge.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {charge.label}
                        </label>
                        <input
                          key={`${charge.key}-input`}
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          value={getFormValue(charge.key) || ''}
                          onChange={(e) => handleChange(charge.key, e.target.value === '' ? 0 : Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              </div>
            </div>

            {/* Pricing & Review Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Pricing & Review</h3>
              <div className="space-y-4">
                {/* Real-time Pricing Preview */}
                {pricing && (
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3">Real-time Pricing Preview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Material Cost:</span>
                        <span className="font-medium">₹{pricing.material_cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Printing Cost:</span>
                        <span className="font-medium">₹{pricing.printing_cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Finishing Cost:</span>
                        <span className="font-medium">₹{pricing.finishing_cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pre-Press Cost:</span>
                        <span className="font-medium">₹{pricing.pre_press_cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overhead (15%):</span>
                        <span className="font-medium">₹{pricing.overhead_cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t border-blue-200 pt-2">
                        <span>Subtotal:</span>
                        <span>₹{pricing.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profit Margin ({pricing.profit_margin_percent}%):</span>
                        <span className="font-medium text-green-600">₹{pricing.profit_margin_amount.toLocaleString()}</span>
                      </div>
                      {pricing.discount_percent > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Discount ({pricing.discount_percent}%):</span>
                          <span className="font-medium">-₹{pricing.discount_amount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Tax ({pricing.tax_percent}%):</span>
                        <span className="font-medium">₹{pricing.tax_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t border-blue-200 pt-2 text-blue-900">
                        <span>Total Amount:</span>
                        <span>₹{pricing.total_amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {!pricing && (
                  <div className="bg-gray-50 p-4 rounded border border-gray-200 text-center text-gray-600 text-sm">
                    Fill in Product Type, Quantity, Length, Width, and GSM to see pricing calculations
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profit Margin (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={getFormValue("profit_margin_percent") || 20}
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
                      value={getFormValue("discount_percent") || 0}
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
                      value={getFormValue("tax_percent") || 18}
                      onChange={(e) => handleChange('tax_percent', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={getFormValue("notes") || ''}
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
