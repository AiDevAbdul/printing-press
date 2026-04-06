export interface Design {
  id: string;
  name: string;
  design_type: string;
  product_category: string;
  product_name?: string;
  status: string;
  designer_id?: string;
  designer?: { name: string };
  specs_sheet_url?: string;
  approval_sheet_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  approvals?: any[];
  attachments?: any[];
}

export interface Stats {
  total: number;
  inDesign: number;
  waitingForData: number;
  approved: number;
  rejected: number;
}

export interface User {
  id: string;
  name: string;
}

export interface Attachment {
  id?: string;
  file_name: string;
  file_url: string;
  file_type?: string;
}
