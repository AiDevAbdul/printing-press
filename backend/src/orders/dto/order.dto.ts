import { IsString, IsDate, IsEnum, IsNumber, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, OrderPriority, PrintingType, ProductType, VarnishType, LaminationType, DieType } from '../entities/order.entity';

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
  strength?: string;

  @IsOptional()
  @IsString()
  type?: string;

  // Color Details
  @IsOptional()
  @IsString()
  color_cmyk?: string;

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
  @IsEnum(VarnishType)
  varnish_type?: VarnishType;

  @IsOptional()
  @IsString()
  varnish_details?: string;

  // Lamination
  @IsOptional()
  @IsEnum(LaminationType)
  lamination_type?: LaminationType;

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
  strength?: string;

  @IsOptional()
  @IsString()
  type?: string;

  // Color Details
  @IsOptional()
  @IsString()
  color_cmyk?: string;

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
  @IsEnum(VarnishType)
  varnish_type?: VarnishType;

  @IsOptional()
  @IsString()
  varnish_details?: string;

  // Lamination
  @IsOptional()
  @IsEnum(LaminationType)
  lamination_type?: LaminationType;

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
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
