import { IsString, IsDate, IsEnum, IsNumber, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, OrderPriority, PrintingType, ProductType, VarnishType, LaminationType, DieType, DesignFileStatus, ColorSeparationType, PlateMaterial, PlateCondition, PlateApprovalStatus, ProofStatus, ColorMatchingStandard } from '../entities/order.entity';

export class CreateOrderDto {
  @IsUUID()
  customer_id: string;

  @IsDate()
  @Type(() => Date)
  order_date: Date;

  @IsDate()
  @Type(() => Date)
  delivery_date: Date;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority;

  @IsString()
  product_name: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsNumber()
  size_length?: number;

  @IsOptional()
  @IsNumber()
  size_width?: number;

  @IsOptional()
  @IsString()
  size_unit?: string;

  @IsOptional()
  @IsString()
  substrate?: string;

  @IsOptional()
  @IsString()
  gsm?: string;

  @IsOptional()
  @IsString()
  colors?: string;

  @IsOptional()
  @IsEnum(PrintingType)
  printing_type?: PrintingType;

  @IsOptional()
  @IsString()
  finishing_requirements?: string;

  @IsOptional()
  @IsString()
  special_instructions?: string;

  @IsOptional()
  @IsNumber()
  quoted_price?: number;

  @IsOptional()
  @IsNumber()
  final_price?: number;

  // Product Type Classification
  @IsOptional()
  @IsEnum(ProductType)
  product_type?: ProductType;

  @IsOptional()
  @IsBoolean()
  is_repeat_order?: boolean;

  @IsOptional()
  @IsUUID()
  previous_order_id?: string;

  // Detailed Specifications (CPP001)
  @IsOptional()
  @IsString()
  card_size?: string;

  @IsOptional()
  @IsString()
  card_width?: string;

  @IsOptional()
  @IsString()
  card_length?: string;

  @IsOptional()
  @IsString()
  strength?: string;

  @IsOptional()
  @IsString()
  type?: string;

  // Color Details
  @IsOptional()
  @IsString()
  color_cyan?: string;

  @IsOptional()
  @IsString()
  color_magenta?: string;

  @IsOptional()
  @IsString()
  color_yellow?: string;

  @IsOptional()
  @IsString()
  color_black?: string;

  @IsOptional()
  @IsString()
  color_p1?: string;

  @IsOptional()
  @IsString()
  color_p2?: string;

  @IsOptional()
  @IsString()
  color_p3?: string;

  @IsOptional()
  @IsString()
  color_p4?: string;

  // Varnish Details
  @IsOptional()
  @IsString({ each: true })
  varnish_type?: string[];

  @IsOptional()
  @IsString()
  varnish_details?: string;

  // Lamination
  @IsOptional()
  @IsString({ each: true })
  lamination_type?: string[];

  @IsOptional()
  @IsString()
  lamination_size?: string;

  // Embossing & Finishing
  @IsOptional()
  @IsString()
  uv_emboss_details?: string;

  @IsOptional()
  @IsBoolean()
  has_back_printing?: boolean;

  @IsOptional()
  @IsBoolean()
  has_barcode?: boolean;

  @IsOptional()
  @IsString()
  batch_number?: string;

  // Pre-Press
  @IsOptional()
  @IsString()
  ctp_info?: string;

  @IsOptional()
  @IsEnum(DieType)
  die_type?: DieType;

  @IsOptional()
  @IsString()
  die_reference?: string;

  @IsOptional()
  @IsString()
  emboss_film_details?: string;

  @IsOptional()
  @IsString()
  plate_reference?: string;

  // Design Tracking
  @IsOptional()
  @IsString()
  designer_name?: string;

  @IsOptional()
  @IsString()
  design_approved_by?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  design_approved_at?: Date;

  // Product-Specific Fields - For Silvo/Blister Foil
  @IsOptional()
  @IsString()
  cylinder_reference?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cylinder_sent_date?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cylinder_approved_date?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cylinder_received_date?: Date;

  // For Bent Foil / Alu-Alu
  @IsOptional()
  @IsNumber()
  thickness_micron?: number;

  @IsOptional()
  @IsString()
  tablet_size?: string;

  @IsOptional()
  @IsString()
  punch_size?: string;

  // Enhanced Order Tracking (Part 4)
  @IsOptional()
  @IsString()
  group_name?: string;

  @IsOptional()
  @IsString()
  specifications?: string;

  @IsOptional()
  @IsString()
  production_status?: string;

  @IsOptional()
  @IsBoolean()
  auto_sync_enabled?: boolean;

  // Design & File Management
  @IsOptional()
  @IsEnum(DesignFileStatus)
  design_file_status?: DesignFileStatus;

  @IsOptional()
  @IsString()
  design_file_formats?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  design_approval_date?: Date;

  @IsOptional()
  @IsNumber()
  design_revisions_count?: number;

  @IsOptional()
  @IsString()
  design_notes?: string;

  // Plate & Separation Details
  @IsOptional()
  @IsEnum(ColorSeparationType)
  color_separation_type?: ColorSeparationType;

  @IsOptional()
  @IsNumber()
  number_of_plates?: number;

  @IsOptional()
  @IsString()
  plate_size?: string;

  @IsOptional()
  @IsEnum(PlateMaterial)
  plate_material?: PlateMaterial;

  @IsOptional()
  @IsEnum(PlateCondition)
  plate_condition?: PlateCondition;

  @IsOptional()
  @IsEnum(PlateApprovalStatus)
  plate_approval_status?: PlateApprovalStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  plate_approval_date?: Date;

  // Proofing & Quality Control
  @IsOptional()
  @IsString()
  proof_type_required?: string;

  @IsOptional()
  @IsEnum(ProofStatus)
  proof_status?: ProofStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  proof_approval_date?: Date;

  @IsOptional()
  @IsEnum(ColorMatchingStandard)
  color_matching_standard?: ColorMatchingStandard;

  @IsOptional()
  @IsString()
  quality_check_notes?: string;

  @IsOptional()
  @IsString()
  approved_by?: string;

  // Production Setup & Machine Requirements
  @IsOptional()
  @IsString()
  preferred_machines?: string;

  @IsOptional()
  @IsBoolean()
  special_setup_required?: boolean;

  @IsOptional()
  @IsString()
  setup_instructions?: string;

  @IsOptional()
  @IsNumber()
  estimated_setup_time?: number;

  @IsOptional()
  @IsString()
  machine_calibration_notes?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  order_date?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  delivery_date?: Date;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority;

  @IsOptional()
  @IsString()
  product_name?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  size_length?: number;

  @IsOptional()
  @IsNumber()
  size_width?: number;

  @IsOptional()
  @IsString()
  size_unit?: string;

  @IsOptional()
  @IsString()
  substrate?: string;

  @IsOptional()
  @IsString()
  gsm?: string;

  @IsOptional()
  @IsString()
  colors?: string;

  @IsOptional()
  @IsEnum(PrintingType)
  printing_type?: PrintingType;

  @IsOptional()
  @IsString()
  finishing_requirements?: string;

  @IsOptional()
  @IsString()
  special_instructions?: string;

  @IsOptional()
  @IsNumber()
  quoted_price?: number;

  @IsOptional()
  @IsNumber()
  final_price?: number;

  // Product Type Classification
  @IsOptional()
  @IsEnum(ProductType)
  product_type?: ProductType;

  @IsOptional()
  @IsBoolean()
  is_repeat_order?: boolean;

  @IsOptional()
  @IsUUID()
  previous_order_id?: string;

  // Detailed Specifications (CPP001)
  @IsOptional()
  @IsString()
  card_size?: string;

  @IsOptional()
  @IsString()
  card_width?: string;

  @IsOptional()
  @IsString()
  card_length?: string;

  @IsOptional()
  @IsString()
  strength?: string;

  @IsOptional()
  @IsString()
  type?: string;

  // Color Details
  @IsOptional()
  @IsString()
  color_cyan?: string;

  @IsOptional()
  @IsString()
  color_magenta?: string;

  @IsOptional()
  @IsString()
  color_yellow?: string;

  @IsOptional()
  @IsString()
  color_black?: string;

  @IsOptional()
  @IsString()
  color_p1?: string;

  @IsOptional()
  @IsString()
  color_p2?: string;

  @IsOptional()
  @IsString()
  color_p3?: string;

  @IsOptional()
  @IsString()
  color_p4?: string;

  // Varnish Details
  @IsOptional()
  @IsString({ each: true })
  varnish_type?: string[];

  @IsOptional()
  @IsString()
  varnish_details?: string;

  // Lamination
  @IsOptional()
  @IsString({ each: true })
  lamination_type?: string[];

  @IsOptional()
  @IsString()
  lamination_size?: string;

  // Embossing & Finishing
  @IsOptional()
  @IsString()
  uv_emboss_details?: string;

  @IsOptional()
  @IsBoolean()
  has_back_printing?: boolean;

  @IsOptional()
  @IsBoolean()
  has_barcode?: boolean;

  @IsOptional()
  @IsString()
  batch_number?: string;

  // Pre-Press
  @IsOptional()
  @IsString()
  ctp_info?: string;

  @IsOptional()
  @IsEnum(DieType)
  die_type?: DieType;

  @IsOptional()
  @IsString()
  die_reference?: string;

  @IsOptional()
  @IsString()
  emboss_film_details?: string;

  @IsOptional()
  @IsString()
  plate_reference?: string;

  // Design Tracking
  @IsOptional()
  @IsString()
  designer_name?: string;

  @IsOptional()
  @IsString()
  design_approved_by?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  design_approved_at?: Date;

  // Product-Specific Fields - For Silvo/Blister Foil
  @IsOptional()
  @IsString()
  cylinder_reference?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cylinder_sent_date?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cylinder_approved_date?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cylinder_received_date?: Date;

  // For Bent Foil / Alu-Alu
  @IsOptional()
  @IsNumber()
  thickness_micron?: number;

  @IsOptional()
  @IsString()
  tablet_size?: string;

  @IsOptional()
  @IsString()
  punch_size?: string;

  // Enhanced Order Tracking (Part 4)
  @IsOptional()
  @IsString()
  group_name?: string;

  @IsOptional()
  @IsString()
  specifications?: string;

  @IsOptional()
  @IsString()
  production_status?: string;

  @IsOptional()
  @IsBoolean()
  auto_sync_enabled?: boolean;

  // Design & File Management
  @IsOptional()
  @IsEnum(DesignFileStatus)
  design_file_status?: DesignFileStatus;

  @IsOptional()
  @IsString()
  design_file_formats?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  design_approval_date?: Date;

  @IsOptional()
  @IsNumber()
  design_revisions_count?: number;

  @IsOptional()
  @IsString()
  design_notes?: string;

  // Plate & Separation Details
  @IsOptional()
  @IsEnum(ColorSeparationType)
  color_separation_type?: ColorSeparationType;

  @IsOptional()
  @IsNumber()
  number_of_plates?: number;

  @IsOptional()
  @IsString()
  plate_size?: string;

  @IsOptional()
  @IsEnum(PlateMaterial)
  plate_material?: PlateMaterial;

  @IsOptional()
  @IsEnum(PlateCondition)
  plate_condition?: PlateCondition;

  @IsOptional()
  @IsEnum(PlateApprovalStatus)
  plate_approval_status?: PlateApprovalStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  plate_approval_date?: Date;

  // Proofing & Quality Control
  @IsOptional()
  @IsString()
  proof_type_required?: string;

  @IsOptional()
  @IsEnum(ProofStatus)
  proof_status?: ProofStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  proof_approval_date?: Date;

  @IsOptional()
  @IsEnum(ColorMatchingStandard)
  color_matching_standard?: ColorMatchingStandard;

  @IsOptional()
  @IsString()
  quality_check_notes?: string;

  @IsOptional()
  @IsString()
  approved_by?: string;

  // Production Setup & Machine Requirements
  @IsOptional()
  @IsString()
  preferred_machines?: string;

  @IsOptional()
  @IsBoolean()
  special_setup_required?: boolean;

  @IsOptional()
  @IsString()
  setup_instructions?: string;

  @IsOptional()
  @IsNumber()
  estimated_setup_time?: number;

  @IsOptional()
  @IsString()
  machine_calibration_notes?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
