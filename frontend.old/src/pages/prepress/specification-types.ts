export interface ProductSpecification {
  id: string;
  company_id: string;
  design_id?: string;
  product_name: string;
  customer_group?: 'export' | 'local' | 'govt';
  file_folder_name?: string;
  form_number?: string;
  card_type?: 'plain' | 'coated' | 'uncoated' | 'specialty';
  card_gramage?: number;
  back_printing: boolean;
  lamination_type: 'uv' | 'matte' | 'gloss' | 'emboss' | 'metalize' | 'none';
  lamination_shine: boolean;
  lamination_metalize: boolean;
  lamination_emboss: boolean;
  lamination_details?: string;
  varnish_type: 'water_base' | 'duck' | 'none';
  varnish_spot_uv: boolean;
  varnish_drip_off: boolean;
  varnish_matt: boolean;
  has_barcode: boolean;
  batch_number?: string;
  has_price: boolean;
  color_cyan: boolean;
  color_magenta: boolean;
  color_yellow: boolean;
  color_black: boolean;
  has_special_colors: boolean;
  special_colors_detail?: string;
  pantone_p1?: string;
  pantone_p2?: string;
  pantone_p3?: string;
  pantone_p4?: string;
  required_card_length?: number;
  required_card_width?: number;
  required_card_gramage?: number;
  printing_card_length?: number;
  printing_card_width?: number;
  printing_card_gramage?: number;
  ups_code?: string;
  grain_side_first: boolean;
  old_dye_code?: string;
  new_dye_code?: string;
  is_new_dye: boolean;
  ctp_required: boolean;
  drip_off_required: boolean;
  spot_uv_required: boolean;
  emboss_required: boolean;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  prepared_by_id?: string;
  received_by_id?: string;
  grn_number?: string;
  other_information?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SpecificationApproval {
  id: string;
  company_id: string;
  specification_id: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  comments?: string;
  approved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SpecificationStats {
  total: number;
  draft: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Design {
  id: string;
  name: string;
  design_type: string;
  product_category: string;
  product_name?: string;
  status: string;
}
