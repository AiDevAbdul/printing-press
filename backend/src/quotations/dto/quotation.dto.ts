import {
  IsString,
  IsUUID,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  QuotationStatus,
  ProductType,
  VarnishType,
  LaminationType,
} from '../entities/quotation.entity';

export class QuotationItemDto {
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  unit_price: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateQuotationDto {
  @IsUUID()
  customer_id: string;

  @IsDateString()
  quotation_date: string;

  @IsDateString()
  valid_until: string;

  // Product Details
  @IsString()
  product_name: string;

  @IsEnum(ProductType)
  product_type: ProductType;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  unit: string;

  // Dimensions
  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @IsOptional()
  @IsString()
  dimension_unit?: string;

  // Material Specifications
  @IsOptional()
  @IsString()
  paper_type?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gsm?: number;

  @IsOptional()
  @IsString()
  board_quality?: string;

  // Color Specifications
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  color_front?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  color_back?: number;

  @IsOptional()
  @IsBoolean()
  pantone_p1?: boolean;

  @IsOptional()
  @IsString()
  pantone_p1_code?: string;

  @IsOptional()
  @IsBoolean()
  pantone_p2?: boolean;

  @IsOptional()
  @IsString()
  pantone_p2_code?: string;

  @IsOptional()
  @IsBoolean()
  pantone_p3?: boolean;

  @IsOptional()
  @IsString()
  pantone_p3_code?: string;

  @IsOptional()
  @IsBoolean()
  pantone_p4?: boolean;

  @IsOptional()
  @IsString()
  pantone_p4_code?: string;

  // Finishing
  @IsOptional()
  @IsEnum(VarnishType)
  varnish_type?: VarnishType;

  @IsOptional()
  @IsEnum(LaminationType)
  lamination_type?: LaminationType;

  @IsOptional()
  @IsBoolean()
  embossing?: boolean;

  @IsOptional()
  @IsString()
  embossing_details?: string;

  @IsOptional()
  @IsBoolean()
  foiling?: boolean;

  @IsOptional()
  @IsString()
  foiling_details?: string;

  @IsOptional()
  @IsBoolean()
  die_cutting?: boolean;

  @IsOptional()
  @IsString()
  die_cutting_details?: string;

  @IsOptional()
  @IsBoolean()
  pasting?: boolean;

  @IsOptional()
  @IsString()
  pasting_details?: string;

  // Pre-Press
  @IsOptional()
  @IsBoolean()
  ctp_required?: boolean;

  @IsOptional()
  @IsString()
  ctp_details?: string;

  @IsOptional()
  @IsString()
  die_type?: string;

  @IsOptional()
  @IsString()
  plate_reference?: string;

  // Product Type Specific Fields
  @IsOptional()
  @IsNumber()
  @Min(0)
  cylinder_size?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  foil_thickness?: number;

  @IsOptional()
  @IsString()
  tablet_size?: string;

  @IsOptional()
  @IsString()
  punch_size?: string;

  // Pricing
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  profit_margin_percent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount_percent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tax_percent?: number;

  // Additional Items
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items?: QuotationItemDto[];

  // Notes
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  terms_and_conditions?: string;
}

export class UpdateQuotationDto {
  @IsOptional()
  @IsDateString()
  quotation_date?: string;

  @IsOptional()
  @IsDateString()
  valid_until?: string;

  @IsOptional()
  @IsString()
  product_name?: string;

  @IsOptional()
  @IsEnum(ProductType)
  product_type?: ProductType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @IsOptional()
  @IsString()
  dimension_unit?: string;

  @IsOptional()
  @IsString()
  paper_type?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gsm?: number;

  @IsOptional()
  @IsString()
  board_quality?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  color_front?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  color_back?: number;

  @IsOptional()
  @IsBoolean()
  pantone_p1?: boolean;

  @IsOptional()
  @IsString()
  pantone_p1_code?: string;

  @IsOptional()
  @IsBoolean()
  pantone_p2?: boolean;

  @IsOptional()
  @IsString()
  pantone_p2_code?: string;

  @IsOptional()
  @IsBoolean()
  pantone_p3?: boolean;

  @IsOptional()
  @IsString()
  pantone_p3_code?: string;

  @IsOptional()
  @IsBoolean()
  pantone_p4?: boolean;

  @IsOptional()
  @IsString()
  pantone_p4_code?: string;

  @IsOptional()
  @IsEnum(VarnishType)
  varnish_type?: VarnishType;

  @IsOptional()
  @IsEnum(LaminationType)
  lamination_type?: LaminationType;

  @IsOptional()
  @IsBoolean()
  embossing?: boolean;

  @IsOptional()
  @IsString()
  embossing_details?: string;

  @IsOptional()
  @IsBoolean()
  foiling?: boolean;

  @IsOptional()
  @IsString()
  foiling_details?: string;

  @IsOptional()
  @IsBoolean()
  die_cutting?: boolean;

  @IsOptional()
  @IsString()
  die_cutting_details?: string;

  @IsOptional()
  @IsBoolean()
  pasting?: boolean;

  @IsOptional()
  @IsString()
  pasting_details?: string;

  @IsOptional()
  @IsBoolean()
  ctp_required?: boolean;

  @IsOptional()
  @IsString()
  ctp_details?: string;

  @IsOptional()
  @IsString()
  die_type?: string;

  @IsOptional()
  @IsString()
  plate_reference?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cylinder_size?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  foil_thickness?: number;

  @IsOptional()
  @IsString()
  tablet_size?: string;

  @IsOptional()
  @IsString()
  punch_size?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  profit_margin_percent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount_percent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tax_percent?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items?: QuotationItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  terms_and_conditions?: string;
}

export class CalculatePricingDto {
  @IsEnum(ProductType)
  product_type: ProductType;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gsm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  color_front?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  color_back?: number;

  @IsOptional()
  @IsBoolean()
  pantone_p1?: boolean;

  @IsOptional()
  @IsBoolean()
  pantone_p2?: boolean;

  @IsOptional()
  @IsBoolean()
  pantone_p3?: boolean;

  @IsOptional()
  @IsBoolean()
  pantone_p4?: boolean;

  @IsOptional()
  @IsEnum(VarnishType)
  varnish_type?: VarnishType;

  @IsOptional()
  @IsEnum(LaminationType)
  lamination_type?: LaminationType;

  @IsOptional()
  @IsBoolean()
  embossing?: boolean;

  @IsOptional()
  @IsBoolean()
  foiling?: boolean;

  @IsOptional()
  @IsBoolean()
  die_cutting?: boolean;

  @IsOptional()
  @IsBoolean()
  pasting?: boolean;

  @IsOptional()
  @IsBoolean()
  ctp_required?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  profit_margin_percent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount_percent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tax_percent?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items?: QuotationItemDto[];
}

export class ConvertToOrderDto {
  @IsOptional()
  @IsDateString()
  order_date?: string;

  @IsOptional()
  @IsDateString()
  delivery_date?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
