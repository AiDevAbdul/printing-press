import api from './api';

export interface QuotationItem {
  id?: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price?: number;
  notes?: string;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  version: number;
  parent_quotation_id?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'converted';
  customer_id: string;
  customer?: any;
  quotation_date: string;
  valid_until: string;
  product_name: string;
  product_type: 'cpp_carton' | 'silvo_blister' | 'bent_foil' | 'alu_alu';
  quantity: number;
  unit: string;
  length?: number;
  width?: number;
  height?: number;
  dimension_unit?: string;
  paper_type?: string;
  gsm?: number;
  board_quality?: string;
  color_front?: number;
  color_back?: number;
  pantone_p1?: boolean;
  pantone_p1_code?: string;
  pantone_p2?: boolean;
  pantone_p2_code?: string;
  pantone_p3?: boolean;
  pantone_p3_code?: string;
  pantone_p4?: boolean;
  pantone_p4_code?: string;
  varnish_type?: string;
  lamination_type?: string;
  embossing?: boolean;
  embossing_details?: string;
  foiling?: boolean;
  foiling_details?: string;
  die_cutting?: boolean;
  die_cutting_details?: string;
  pasting?: boolean;
  pasting_details?: string;
  ctp_required?: boolean;
  ctp_details?: string;
  die_type?: string;
  plate_reference?: string;
  cylinder_size?: number;
  foil_thickness?: number;
  tablet_size?: string;
  punch_size?: string;
  material_cost: number;
  printing_cost: number;
  finishing_cost: number;
  pre_press_cost: number;
  overhead_cost: number;
  subtotal: number;
  profit_margin_percent: number;
  profit_margin_amount: number;
  discount_percent: number;
  discount_amount: number;
  tax_percent: number;
  tax_amount: number;
  total_amount: number;
  items?: QuotationItem[];
  notes?: string;
  terms_and_conditions?: string;
  converted_to_order_id?: string;
  converted_to_order?: any;
  converted_at?: string;
  created_by_id: string;
  created_by?: any;
  sent_at?: string;
  approved_at?: string;
  rejected_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateQuotationDto {
  customer_id: string;
  quotation_date: string;
  valid_until: string;
  product_name: string;
  product_type: 'cpp_carton' | 'silvo_blister' | 'bent_foil' | 'alu_alu';
  quantity: number;
  unit: string;
  length?: number;
  width?: number;
  height?: number;
  dimension_unit?: string;
  paper_type?: string;
  gsm?: number;
  board_quality?: string;
  color_front?: number;
  color_back?: number;
  pantone_p1?: boolean;
  pantone_p1_code?: string;
  pantone_p2?: boolean;
  pantone_p2_code?: string;
  pantone_p3?: boolean;
  pantone_p3_code?: string;
  pantone_p4?: boolean;
  pantone_p4_code?: string;
  varnish_type?: string;
  lamination_type?: string;
  embossing?: boolean;
  embossing_details?: string;
  foiling?: boolean;
  foiling_details?: string;
  die_cutting?: boolean;
  die_cutting_details?: string;
  pasting?: boolean;
  pasting_details?: string;
  ctp_required?: boolean;
  ctp_details?: string;
  die_type?: string;
  plate_reference?: string;
  cylinder_size?: number;
  foil_thickness?: number;
  tablet_size?: string;
  punch_size?: string;
  profit_margin_percent?: number;
  discount_percent?: number;
  tax_percent?: number;
  items?: QuotationItem[];
  notes?: string;
  terms_and_conditions?: string;
}

export interface PricingBreakdown {
  material_cost: number;
  printing_cost: number;
  finishing_cost: number;
  pre_press_cost: number;
  overhead_cost: number;
  subtotal: number;
  profit_margin_percent: number;
  profit_margin_amount: number;
  discount_percent: number;
  discount_amount: number;
  tax_percent: number;
  tax_amount: number;
  total_amount: number;
}

export const quotationService = {
  async getAll(filters?: {
    status?: string;
    customer_id?: string;
    search?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<{ data: Quotation[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.customer_id) params.append('customer_id', filters.customer_id);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);

    const response = await api.get(`/quotations?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<Quotation> {
    const response = await api.get(`/quotations/${id}`);
    return response.data;
  },

  async create(data: CreateQuotationDto): Promise<Quotation> {
    const response = await api.post('/quotations', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateQuotationDto>): Promise<Quotation> {
    const response = await api.patch(`/quotations/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/quotations/${id}`);
  },

  async calculatePricing(data: Partial<CreateQuotationDto>): Promise<PricingBreakdown> {
    const response = await api.post('/quotations/calculate', data);
    return response.data;
  },

  async send(id: string): Promise<Quotation> {
    const response = await api.post(`/quotations/${id}/send`);
    return response.data;
  },

  async approve(id: string): Promise<Quotation> {
    const response = await api.post(`/quotations/${id}/approve`);
    return response.data;
  },

  async reject(id: string, reason?: string): Promise<Quotation> {
    const response = await api.post(`/quotations/${id}/reject`, { reason });
    return response.data;
  },

  async convertToOrder(
    id: string,
    data?: { order_date?: string; delivery_date?: string; notes?: string }
  ): Promise<any> {
    const response = await api.post(`/quotations/${id}/convert-to-order`, data);
    return response.data;
  },

  async createRevision(id: string): Promise<Quotation> {
    const response = await api.post(`/quotations/${id}/revise`);
    return response.data;
  },

  async getHistory(id: string): Promise<any[]> {
    const response = await api.get(`/quotations/${id}/history`);
    return response.data;
  },
};
