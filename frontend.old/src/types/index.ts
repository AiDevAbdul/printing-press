export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export enum UserRole {
  ADMIN = 'admin',
  SALES = 'sales',
  PLANNER = 'planner',
  ACCOUNTS = 'accounts',
  INVENTORY = 'inventory',
}

export interface Customer {
  id: string;
  name: string;
  company_name?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  gstin?: string;
  credit_limit: number;
  credit_days: number;
  payment_terms?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer: Customer;
  order_date: string;
  delivery_date: string;
  status: OrderStatus;
  priority: OrderPriority;
  product_name: string;
  quantity: number;
  unit: string;
  size_length?: number;
  size_width?: number;
  size_unit?: string;
  substrate?: string;
  gsm?: string;
  colors?: string;
  printing_type?: PrintingType;
  finishing_requirements?: string;
  special_instructions?: string;
  quoted_price?: number;
  final_price?: number;
  group_name?: string;
  product_type?: string;
  strength?: string;
  batch_number?: string;
  specifications?: string;
  production_status?: string;
  auto_sync_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_PRODUCTION = 'in_production',
  COMPLETED = 'completed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum OrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum PrintingType {
  OFFSET = 'offset',
  DIGITAL = 'digital',
  FLEXO = 'flexo',
}

export interface ProductionJob {
  id: string;
  job_number: string;
  order: Order;
  scheduled_start_date?: string;
  scheduled_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  status: ProductionJobStatus;
  assigned_machine?: string;
  assigned_operator?: User;
  estimated_hours?: number;
  actual_hours?: number;
  notes?: string;
  queue_position?: number;
  current_stage?: string;
  current_process?: string;
  inline_status?: string;
  searchable_text?: string;
  estimated_start?: string;
  estimated_completion?: string;
  actual_completion?: string;
  progress_percent?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductionStageHistory {
  id: string;
  job: ProductionJob;
  stage: string;
  process?: string;
  machine?: string;
  operator?: User;
  started_at: string;
  completed_at?: string;
  duration_minutes?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductionFilters {
  search?: string;
  status?: ProductionJobStatus;
  stage?: string;
  machine?: string;
  operator_id?: string;
  customer?: string;
  product?: string;
  page?: number;
  limit?: number;
}

export enum ProductionJobStatus {
  QUEUED = 'queued',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface InventoryItem {
  id: string;
  item_code: string;
  item_name: string;
  main_category?: 'block' | 'paper' | 'other_material';
  category: InventoryCategory;
  subcategory?: string;
  unit: string;
  gsm?: number;
  size?: string;
  size_length?: number;
  size_width?: number;
  material_type?: string;
  brand?: string;
  color?: string;
  current_stock: number;
  reorder_level: number;
  reorder_quantity: number;
  unit_cost: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export enum InventoryCategory {
  PAPER = 'paper',
  INK = 'ink',
  PLATES = 'plates',
  FINISHING_MATERIALS = 'finishing_materials',
  PACKAGING = 'packaging',
}

export interface InventoryFilters {
  main_category?: string;
  category?: string;
  size?: string;
  gsm?: number;
  material_type?: string;
  brand?: string;
  color?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface StockTransaction {
  id: string;
  transaction_type: TransactionType;
  item: InventoryItem;
  quantity: number;
  unit_cost: number;
  reference_type: ReferenceType;
  reference_id?: string;
  notes?: string;
  transaction_date: string;
  created_at: string;
}

export enum TransactionType {
  STOCK_IN = 'stock_in',
  STOCK_OUT = 'stock_out',
  ADJUSTMENT = 'adjustment',
}

export enum ReferenceType {
  PURCHASE = 'purchase',
  PRODUCTION_JOB = 'production_job',
  ADJUSTMENT = 'adjustment',
}

export interface Invoice {
  id: string;
  invoice_number: string;
  order: Order;
  customer: Customer;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  status: InvoiceStatus;
  payment_terms?: string;
  notes?: string;
  company_name?: string;
  group_name?: string;
  product_type?: string;
  final_quantity?: number;
  unit_rate?: number;
  strength?: string;
  sales_tax_applicable?: boolean;
  created_at: string;
  updated_at: string;
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface JobCost {
  id: string;
  job_id?: string;
  cost_type: CostType;
  item?: InventoryItem;
  description: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  created_at: string;
  // Auto-calculated fields
  card_length?: number;
  card_width?: number;
  card_gsm?: number;
  card_type?: string;
  colors_cmyk?: boolean;
  special_colors_count?: number;
  special_colors?: string;
  uv_type?: string;
  lamination_required?: boolean;
  embossing_required?: boolean;
  material_cost?: number;
  printing_cost_cmyk?: number;
  printing_cost_special?: number;
  uv_cost?: number;
  lamination_cost?: number;
  die_cutting_cost?: number;
  embossing_cost?: number;
  pre_press_charges?: number;
  total_processing_cost?: number;
  cost_per_unit?: number;
}

export interface CostCalculation {
  job_id: string;
  order_id: string;
  product_name: string;
  specifications: {
    card_length: number;
    card_width: number;
    card_gsm: number;
    card_type: string;
    quantity: number;
    colors_cmyk: boolean;
    special_colors_count: number;
    special_colors: string;
    uv_type: string;
    lamination_required: boolean;
    embossing_required: boolean;
  };
  cost_breakdown: {
    material_cost: number;
    printing_cost_cmyk: number;
    printing_cost_special: number;
    uv_cost: number;
    lamination_cost: number;
    embossing_cost: number;
    die_cutting_cost: number;
    pre_press_charges: number;
    total_processing_cost: number;
    total_cost: number;
    cost_per_unit: number;
  };
  formulas_used: {
    material: string;
    printing_cmyk: string;
    printing_special: string;
  };
}

export interface CostingConfig {
  id: string;
  paper_rate_per_kg: number;
  gsm_rate_factor: number;
  cmyk_base_rate: number;
  special_color_rate: number;
  spot_uv_rate_per_sqm: number;
  lamination_rate_per_sqm: number;
  embossing_rate_per_job: number;
  die_cutting_rate_per_1000: number;
  pre_press_simple: number;
  pre_press_medium: number;
  pre_press_complex: number;
  pre_press_rush: number;
  is_active: boolean;
  updated_at: string;
}

export enum CostType {
  MATERIAL = 'material',
  LABOR = 'labor',
  MACHINE = 'machine',
  OVERHEAD = 'overhead',
}

export interface DashboardStats {
  orders: {
    pending: number;
    approved: number;
    in_production: number;
    completed: number;
    delivered: number;
    total: number;
  };
  production_jobs: {
    queued: number;
    in_progress: number;
    paused: number;
    completed: number;
    total: number;
  };
  low_stock_items: number;
  pending_invoices_amount: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}
