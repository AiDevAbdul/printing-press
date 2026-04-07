import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ProductSpecification } from './specification-types';

interface SpecificationFormModalProps {
  specification?: ProductSpecification | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export default function SpecificationFormModal({
  specification,
  onSubmit,
  onClose,
}: SpecificationFormModalProps) {
  const [formData, setFormData] = useState({
    product_name: '',
    customer_group: '',
    file_folder_name: '',
    form_number: '',
    card_type: '',
    card_gramage: '',
    back_printing: false,
    lamination_type: 'none',
    lamination_shine: false,
    lamination_metalize: false,
    lamination_emboss: false,
    lamination_details: '',
    varnish_type: 'none',
    varnish_spot_uv: false,
    varnish_drip_off: false,
    varnish_matt: false,
    has_barcode: false,
    batch_number: '',
    has_price: false,
    color_cyan: false,
    color_magenta: false,
    color_yellow: false,
    color_black: false,
    has_special_colors: false,
    special_colors_detail: '',
    pantone_p1: '',
    pantone_p2: '',
    pantone_p3: '',
    pantone_p4: '',
    required_card_length: '',
    required_card_width: '',
    required_card_gramage: '',
    printing_card_length: '',
    printing_card_width: '',
    printing_card_gramage: '',
    ups_code: '',
    grain_side_first: false,
    old_dye_code: '',
    new_dye_code: '',
    is_new_dye: false,
    ctp_required: false,
    drip_off_required: false,
    spot_uv_required: false,
    emboss_required: false,
    status: 'draft',
    grn_number: '',
    other_information: '',
  });

  useEffect(() => {
    if (specification) {
      setFormData({
        product_name: specification.product_name || '',
        customer_group: specification.customer_group || '',
        file_folder_name: specification.file_folder_name || '',
        form_number: specification.form_number || '',
        card_type: specification.card_type || '',
        card_gramage: specification.card_gramage?.toString() || '',
        back_printing: specification.back_printing || false,
        lamination_type: specification.lamination_type || 'none',
        lamination_shine: specification.lamination_shine || false,
        lamination_metalize: specification.lamination_metalize || false,
        lamination_emboss: specification.lamination_emboss || false,
        lamination_details: specification.lamination_details || '',
        varnish_type: specification.varnish_type || 'none',
        varnish_spot_uv: specification.varnish_spot_uv || false,
        varnish_drip_off: specification.varnish_drip_off || false,
        varnish_matt: specification.varnish_matt || false,
        has_barcode: specification.has_barcode || false,
        batch_number: specification.batch_number || '',
        has_price: specification.has_price || false,
        color_cyan: specification.color_cyan || false,
        color_magenta: specification.color_magenta || false,
        color_yellow: specification.color_yellow || false,
        color_black: specification.color_black || false,
        has_special_colors: specification.has_special_colors || false,
        special_colors_detail: specification.special_colors_detail || '',
        pantone_p1: specification.pantone_p1 || '',
        pantone_p2: specification.pantone_p2 || '',
        pantone_p3: specification.pantone_p3 || '',
        pantone_p4: specification.pantone_p4 || '',
        required_card_length: specification.required_card_length?.toString() || '',
        required_card_width: specification.required_card_width?.toString() || '',
        required_card_gramage: specification.required_card_gramage?.toString() || '',
        printing_card_length: specification.printing_card_length?.toString() || '',
        printing_card_width: specification.printing_card_width?.toString() || '',
        printing_card_gramage: specification.printing_card_gramage?.toString() || '',
        ups_code: specification.ups_code || '',
        grain_side_first: specification.grain_side_first || false,
        old_dye_code: specification.old_dye_code || '',
        new_dye_code: specification.new_dye_code || '',
        is_new_dye: specification.is_new_dye || false,
        ctp_required: specification.ctp_required || false,
        drip_off_required: specification.drip_off_required || false,
        spot_uv_required: specification.spot_uv_required || false,
        emboss_required: specification.emboss_required || false,
        status: specification.status || 'draft',
        grn_number: specification.grn_number || '',
        other_information: specification.other_information || '',
      });
    }
  }, [specification]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedData = {
      product_name: formData.product_name,
      customer_group: formData.customer_group || undefined,
      file_folder_name: formData.file_folder_name || undefined,
      form_number: formData.form_number || undefined,
      card_type: formData.card_type || undefined,
      card_gramage: formData.card_gramage ? parseFloat(formData.card_gramage) : undefined,
      back_printing: formData.back_printing,
      lamination_type: formData.lamination_type || 'none',
      lamination_shine: formData.lamination_shine,
      lamination_metalize: formData.lamination_metalize,
      lamination_emboss: formData.lamination_emboss,
      lamination_details: formData.lamination_details || undefined,
      varnish_type: formData.varnish_type || 'none',
      varnish_spot_uv: formData.varnish_spot_uv,
      varnish_drip_off: formData.varnish_drip_off,
      varnish_matt: formData.varnish_matt,
      has_barcode: formData.has_barcode,
      batch_number: formData.batch_number || undefined,
      has_price: formData.has_price,
      color_cyan: formData.color_cyan,
      color_magenta: formData.color_magenta,
      color_yellow: formData.color_yellow,
      color_black: formData.color_black,
      has_special_colors: formData.has_special_colors,
      special_colors_detail: formData.special_colors_detail || undefined,
      pantone_p1: formData.pantone_p1 || undefined,
      pantone_p2: formData.pantone_p2 || undefined,
      pantone_p3: formData.pantone_p3 || undefined,
      pantone_p4: formData.pantone_p4 || undefined,
      required_card_length: formData.required_card_length ? parseFloat(formData.required_card_length) : undefined,
      required_card_width: formData.required_card_width ? parseFloat(formData.required_card_width) : undefined,
      required_card_gramage: formData.required_card_gramage ? parseFloat(formData.required_card_gramage) : undefined,
      printing_card_length: formData.printing_card_length ? parseFloat(formData.printing_card_length) : undefined,
      printing_card_width: formData.printing_card_width ? parseFloat(formData.printing_card_width) : undefined,
      printing_card_gramage: formData.printing_card_gramage ? parseFloat(formData.printing_card_gramage) : undefined,
      ups_code: formData.ups_code || undefined,
      grain_side_first: formData.grain_side_first,
      old_dye_code: formData.old_dye_code || undefined,
      new_dye_code: formData.new_dye_code || undefined,
      is_new_dye: formData.is_new_dye,
      ctp_required: formData.ctp_required,
      drip_off_required: formData.drip_off_required,
      spot_uv_required: formData.spot_uv_required,
      emboss_required: formData.emboss_required,
      status: formData.status || 'draft',
      grn_number: formData.grn_number || undefined,
      other_information: formData.other_information || undefined,
    };
    onSubmit(cleanedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {specification ? 'EDIT SPECIFICATION' : 'NEW SPECIFICATION'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Product Details */}
          <div className="border-b-2 border-gray-900 pb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">
              Product Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black uppercase tracking-widest text-gray-900 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-black uppercase tracking-widest text-gray-900 mb-2">
                  Customer Group
                </label>
                <select
                  name="customer_group"
                  value={formData.customer_group}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="export">Export</option>
                  <option value="local">Local</option>
                  <option value="govt">Government</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black uppercase tracking-widest text-gray-900 mb-2">
                  File Folder Name
                </label>
                <input
                  type="text"
                  name="file_folder_name"
                  value={formData.file_folder_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-black uppercase tracking-widest text-gray-900 mb-2">
                  Form Number
                </label>
                <input
                  type="text"
                  name="form_number"
                  value={formData.form_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Card Specifications */}
          <div className="border-b-2 border-gray-900 pb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">
              Card Specifications
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black uppercase tracking-widest text-gray-900 mb-2">
                  Card Type
                </label>
                <select
                  name="card_type"
                  value={formData.card_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="plain">Plain</option>
                  <option value="coated">Coated</option>
                  <option value="uncoated">Uncoated</option>
                  <option value="specialty">Specialty</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black uppercase tracking-widest text-gray-900 mb-2">
                  Gramage (gsm)
                </label>
                <input
                  type="number"
                  name="card_gramage"
                  value={formData.card_gramage}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-2 border-2 border-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="back_printing"
                    checked={formData.back_printing}
                    onChange={handleChange}
                    className="w-5 h-5 border-2 border-gray-900"
                  />
                  <span className="text-sm font-black uppercase tracking-widest text-gray-900">
                    Back Printing
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Lamination & Varnish */}
          <div className="border-b-2 border-gray-900 pb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">
              Finishing Options
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black uppercase tracking-widest text-gray-900 mb-2">
                  Lamination Type
                </label>
                <select
                  name="lamination_type"
                  value={formData.lamination_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="uv">UV</option>
                  <option value="matte">Matte</option>
                  <option value="gloss">Gloss</option>
                  <option value="emboss">Emboss</option>
                  <option value="metalize">Metalize</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black uppercase tracking-widest text-gray-900 mb-2">
                  Varnish Type
                </label>
                <select
                  name="varnish_type"
                  value={formData.varnish_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="water_base">Water Base</option>
                  <option value="duck">Duck</option>
                </select>
              </div>
              <div className="col-span-2 space-y-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="lamination_shine"
                    checked={formData.lamination_shine}
                    onChange={handleChange}
                    className="w-5 h-5 border-2 border-gray-900"
                  />
                  <span className="text-sm font-black uppercase tracking-widest text-gray-900">
                    Lamination Shine
                  </span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="varnish_spot_uv"
                    checked={formData.varnish_spot_uv}
                    onChange={handleChange}
                    className="w-5 h-5 border-2 border-gray-900"
                  />
                  <span className="text-sm font-black uppercase tracking-widest text-gray-900">
                    Spot UV
                  </span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="varnish_drip_off"
                    checked={formData.varnish_drip_off}
                    onChange={handleChange}
                    className="w-5 h-5 border-2 border-gray-900"
                  />
                  <span className="text-sm font-black uppercase tracking-widest text-gray-900">
                    Drip Off
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="border-b-2 border-gray-900 pb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">
              Colors
            </h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="color_cyan"
                  checked={formData.color_cyan}
                  onChange={handleChange}
                  className="w-5 h-5 border-2 border-gray-900"
                />
                <span className="text-sm font-black uppercase tracking-widest text-gray-900">C</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="color_magenta"
                  checked={formData.color_magenta}
                  onChange={handleChange}
                  className="w-5 h-5 border-2 border-gray-900"
                />
                <span className="text-sm font-black uppercase tracking-widest text-gray-900">M</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="color_yellow"
                  checked={formData.color_yellow}
                  onChange={handleChange}
                  className="w-5 h-5 border-2 border-gray-900"
                />
                <span className="text-sm font-black uppercase tracking-widest text-gray-900">Y</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="color_black"
                  checked={formData.color_black}
                  onChange={handleChange}
                  className="w-5 h-5 border-2 border-gray-900"
                />
                <span className="text-sm font-black uppercase tracking-widest text-gray-900">K</span>
              </label>
            </div>
            <label className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                name="has_special_colors"
                checked={formData.has_special_colors}
                onChange={handleChange}
                className="w-5 h-5 border-2 border-gray-900"
              />
              <span className="text-sm font-black uppercase tracking-widest text-gray-900">
                Special Colors
              </span>
            </label>
            {formData.has_special_colors && (
              <div className="grid grid-cols-4 gap-4">
                {['pantone_p1', 'pantone_p2', 'pantone_p3', 'pantone_p4'].map((field) => (
                  <input
                    key={field}
                    type="text"
                    name={field}
                    value={(formData[field as keyof typeof formData] as string) || ''}
                    onChange={handleChange}
                    placeholder={`P${field.slice(-1)}`}
                    className="px-4 py-2 border-2 border-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Card Sizing */}
          <div className="border-b-2 border-gray-900 pb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">
              Card Sizing
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-900 mb-2">
                  Required Length
                </label>
                <input
                  type="number"
                  name="required_card_length"
                  value={formData.required_card_length}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-2 border-2 border-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-900 mb-2">
                  Required Width
                </label>
                <input
                  type="number"
                  name="required_card_width"
                  value={formData.required_card_width}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-2 border-2 border-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-900 mb-2">
                  Required Gramage
                </label>
                <input
                  type="number"
                  name="required_card_gramage"
                  value={formData.required_card_gramage}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-2 border-2 border-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-900 mb-2">
                  Printing Length
                </label>
                <input
                  type="number"
                  name="printing_card_length"
                  value={formData.printing_card_length}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-2 border-2 border-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-900 mb-2">
                  Printing Width
                </label>
                <input
                  type="number"
                  name="printing_card_width"
                  value={formData.printing_card_width}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-2 border-2 border-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-900 mb-2">
                  Printing Gramage
                </label>
                <input
                  type="number"
                  name="printing_card_gramage"
                  value={formData.printing_card_gramage}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-2 border-2 border-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Design Section */}
          <div className="border-b-2 border-gray-900 pb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">
              Design Section
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="ctp_required"
                  checked={formData.ctp_required}
                  onChange={handleChange}
                  className="w-5 h-5 border-2 border-gray-900"
                />
                <span className="text-sm font-black uppercase tracking-widest text-gray-900">CTP</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="drip_off_required"
                  checked={formData.drip_off_required}
                  onChange={handleChange}
                  className="w-5 h-5 border-2 border-gray-900"
                />
                <span className="text-sm font-black uppercase tracking-widest text-gray-900">Drip Off</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="spot_uv_required"
                  checked={formData.spot_uv_required}
                  onChange={handleChange}
                  className="w-5 h-5 border-2 border-gray-900"
                />
                <span className="text-sm font-black uppercase tracking-widest text-gray-900">Spot UV</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="emboss_required"
                  checked={formData.emboss_required}
                  onChange={handleChange}
                  className="w-5 h-5 border-2 border-gray-900"
                />
                <span className="text-sm font-black uppercase tracking-widest text-gray-900">Emboss</span>
              </label>
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest text-gray-900 mb-2">
              Other Information
            </label>
            <textarea
              name="other_information"
              value={formData.other_information}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border-2 border-gray-900 rounded-none font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest text-gray-900 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border-2 border-gray-900 text-gray-900 font-bold uppercase tracking-wider hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-gray-900 text-white font-bold uppercase tracking-wider hover:bg-black"
          >
            {specification ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
