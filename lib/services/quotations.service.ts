const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface Quotation {
  id: string;
  quotation_number: string;
  status: string;
  version: number;
  customer_id: string;
  quotation_date: string;
  valid_until: string;
  product_name: string;
  product_type: string;
  quantity: number;
  unit: string;
  double_sheet?: string;
  length?: number;
  width?: number;
  height?: number;
  dimension_unit?: string;
  paper_type?: string;
  gsm?: number;
  // Color process
  four_color_process?: boolean;
  inside_printing?: boolean;
  cmyk_cyan?: boolean;
  cmyk_magenta?: boolean;
  cmyk_yellow?: boolean;
  cmyk_black?: boolean;
  pantone_cmyk_1?: string;
  pantone_cmyk_2?: string;
  pantone_cmyk_3?: string;
  pantone_cmyk_4?: string;
  color_front?: number;
  color_back?: number;
  // Printing details
  bar_code?: string;
  dye_req?: string;
  batch_no_printing?: boolean;
  batch_no?: string;
  mfg_date?: string;
  exp_date?: string;
  mrp_rs?: number;
  // Finishing
  varnish_type?: string;
  foiling?: boolean;
  bleach_card?: boolean;
  box_board_card?: boolean;
  art_card?: boolean;
  // Cost formula
  ups?: number;
  paper_ups?: number;
  price_per_kg_card?: number;
  price_per_kg_paper?: number;
  conversion_percent_card?: number;
  conversion_percent_paper?: number;
  fixed_charge_ctp?: number;
  fixed_charge_spot_uv?: number;
  fixed_charge_plain_uv?: number;
  fixed_charge_drip_off_uv?: number;
  fixed_charge_metalize?: number;
  fixed_charge_emboss?: number;
  fixed_charge_lamination?: number;
  fixed_charge_others?: number;
  special_instructions?: string;
  total_amount?: number;
  final_price?: number;
  customers?: { id: string; name: string; company_name?: string; email?: string; phone?: string };
  created_at: string;
  updated_at?: string;
}

export interface QuotationsResponse {
  data: Quotation[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const quotationsService = {
  async getAll(params: { page?: number; limit?: number; status?: string; search?: string } = {}): Promise<QuotationsResponse> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    const res = await fetch(`${API_BASE}/quotations?${q}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch quotations');
    return res.json();
  },

  async getById(id: string): Promise<Quotation> {
    const res = await fetch(`${API_BASE}/quotations/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch quotation');
    return res.json();
  },

  async create(data: Partial<Quotation>): Promise<Quotation> {
    const res = await fetch(`${API_BASE}/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create quotation');
    return res.json();
  },

  async update(id: string, data: Partial<Quotation>): Promise<Quotation> {
    const res = await fetch(`${API_BASE}/quotations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update quotation');
    return res.json();
  },
};
