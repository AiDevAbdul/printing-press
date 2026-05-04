import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsNumber,
  IsDecimal,
  IsNotEmpty,
} from 'class-validator';
import {
  SpecStatus,
  CustomerGroup,
  CardType,
  LaminationType,
  VarnishType,
} from '../entities/product-specification.entity';
import { ApprovalStatus } from '../entities/specification-approval.entity';

export class CreateProductSpecificationDto {
  @IsNotEmpty()
  @IsString()
  product_name: string;

  @IsOptional()
  @IsUUID()
  design_id?: string;

  @IsOptional()
  @IsEnum(CustomerGroup)
  customer_group?: CustomerGroup;

  @IsOptional()
  @IsString()
  file_folder_name?: string;

  @IsOptional()
  @IsString()
  form_number?: string;

  @IsOptional()
  @IsEnum(CardType)
  card_type?: CardType;

  @IsOptional()
  @IsNumber()
  card_gramage?: number;

  @IsOptional()
  @IsBoolean()
  back_printing?: boolean;

  @IsOptional()
  @IsEnum(LaminationType)
  lamination_type?: LaminationType;

  @IsOptional()
  @IsBoolean()
  lamination_shine?: boolean;

  @IsOptional()
  @IsBoolean()
  lamination_metalize?: boolean;

  @IsOptional()
  @IsBoolean()
  lamination_emboss?: boolean;

  @IsOptional()
  @IsString()
  lamination_details?: string;

  @IsOptional()
  @IsEnum(VarnishType)
  varnish_type?: VarnishType;

  @IsOptional()
  @IsBoolean()
  varnish_spot_uv?: boolean;

  @IsOptional()
  @IsBoolean()
  varnish_drip_off?: boolean;

  @IsOptional()
  @IsBoolean()
  varnish_matt?: boolean;

  @IsOptional()
  @IsBoolean()
  has_barcode?: boolean;

  @IsOptional()
  @IsString()
  batch_number?: string;

  @IsOptional()
  @IsBoolean()
  has_price?: boolean;

  @IsOptional()
  @IsBoolean()
  color_cyan?: boolean;

  @IsOptional()
  @IsBoolean()
  color_magenta?: boolean;

  @IsOptional()
  @IsBoolean()
  color_yellow?: boolean;

  @IsOptional()
  @IsBoolean()
  color_black?: boolean;

  @IsOptional()
  @IsBoolean()
  has_special_colors?: boolean;

  @IsOptional()
  @IsString()
  special_colors_detail?: string;

  @IsOptional()
  @IsString()
  pantone_p1?: string;

  @IsOptional()
  @IsString()
  pantone_p2?: string;

  @IsOptional()
  @IsString()
  pantone_p3?: string;

  @IsOptional()
  @IsString()
  pantone_p4?: string;

  @IsOptional()
  @IsNumber()
  required_card_length?: number;

  @IsOptional()
  @IsNumber()
  required_card_width?: number;

  @IsOptional()
  @IsNumber()
  required_card_gramage?: number;

  @IsOptional()
  @IsNumber()
  printing_card_length?: number;

  @IsOptional()
  @IsNumber()
  printing_card_width?: number;

  @IsOptional()
  @IsNumber()
  printing_card_gramage?: number;

  @IsOptional()
  @IsString()
  ups_code?: string;

  @IsOptional()
  @IsBoolean()
  grain_side_first?: boolean;

  @IsOptional()
  @IsString()
  old_dye_code?: string;

  @IsOptional()
  @IsString()
  new_dye_code?: string;

  @IsOptional()
  @IsBoolean()
  is_new_dye?: boolean;

  @IsOptional()
  @IsBoolean()
  ctp_required?: boolean;

  @IsOptional()
  @IsBoolean()
  drip_off_required?: boolean;

  @IsOptional()
  @IsBoolean()
  spot_uv_required?: boolean;

  @IsOptional()
  @IsBoolean()
  emboss_required?: boolean;

  @IsOptional()
  @IsUUID()
  prepared_by_id?: string;

  @IsOptional()
  @IsUUID()
  received_by_id?: string;

  @IsOptional()
  @IsString()
  grn_number?: string;

  @IsOptional()
  @IsString()
  other_information?: string;
}

export class UpdateProductSpecificationDto {
  @IsOptional()
  @IsString()
  product_name?: string;

  @IsOptional()
  @IsUUID()
  design_id?: string;

  @IsOptional()
  @IsEnum(CustomerGroup)
  customer_group?: CustomerGroup;

  @IsOptional()
  @IsString()
  file_folder_name?: string;

  @IsOptional()
  @IsString()
  form_number?: string;

  @IsOptional()
  @IsEnum(CardType)
  card_type?: CardType;

  @IsOptional()
  @IsNumber()
  card_gramage?: number;

  @IsOptional()
  @IsBoolean()
  back_printing?: boolean;

  @IsOptional()
  @IsEnum(LaminationType)
  lamination_type?: LaminationType;

  @IsOptional()
  @IsBoolean()
  lamination_shine?: boolean;

  @IsOptional()
  @IsBoolean()
  lamination_metalize?: boolean;

  @IsOptional()
  @IsBoolean()
  lamination_emboss?: boolean;

  @IsOptional()
  @IsString()
  lamination_details?: string;

  @IsOptional()
  @IsEnum(VarnishType)
  varnish_type?: VarnishType;

  @IsOptional()
  @IsBoolean()
  varnish_spot_uv?: boolean;

  @IsOptional()
  @IsBoolean()
  varnish_drip_off?: boolean;

  @IsOptional()
  @IsBoolean()
  varnish_matt?: boolean;

  @IsOptional()
  @IsBoolean()
  has_barcode?: boolean;

  @IsOptional()
  @IsString()
  batch_number?: string;

  @IsOptional()
  @IsBoolean()
  has_price?: boolean;

  @IsOptional()
  @IsBoolean()
  color_cyan?: boolean;

  @IsOptional()
  @IsBoolean()
  color_magenta?: boolean;

  @IsOptional()
  @IsBoolean()
  color_yellow?: boolean;

  @IsOptional()
  @IsBoolean()
  color_black?: boolean;

  @IsOptional()
  @IsBoolean()
  has_special_colors?: boolean;

  @IsOptional()
  @IsString()
  special_colors_detail?: string;

  @IsOptional()
  @IsString()
  pantone_p1?: string;

  @IsOptional()
  @IsString()
  pantone_p2?: string;

  @IsOptional()
  @IsString()
  pantone_p3?: string;

  @IsOptional()
  @IsString()
  pantone_p4?: string;

  @IsOptional()
  @IsNumber()
  required_card_length?: number;

  @IsOptional()
  @IsNumber()
  required_card_width?: number;

  @IsOptional()
  @IsNumber()
  required_card_gramage?: number;

  @IsOptional()
  @IsNumber()
  printing_card_length?: number;

  @IsOptional()
  @IsNumber()
  printing_card_width?: number;

  @IsOptional()
  @IsNumber()
  printing_card_gramage?: number;

  @IsOptional()
  @IsString()
  ups_code?: string;

  @IsOptional()
  @IsBoolean()
  grain_side_first?: boolean;

  @IsOptional()
  @IsString()
  old_dye_code?: string;

  @IsOptional()
  @IsString()
  new_dye_code?: string;

  @IsOptional()
  @IsBoolean()
  is_new_dye?: boolean;

  @IsOptional()
  @IsBoolean()
  ctp_required?: boolean;

  @IsOptional()
  @IsBoolean()
  drip_off_required?: boolean;

  @IsOptional()
  @IsBoolean()
  spot_uv_required?: boolean;

  @IsOptional()
  @IsBoolean()
  emboss_required?: boolean;

  @IsOptional()
  @IsEnum(SpecStatus)
  status?: SpecStatus;

  @IsOptional()
  @IsUUID()
  prepared_by_id?: string;

  @IsOptional()
  @IsUUID()
  received_by_id?: string;

  @IsOptional()
  @IsString()
  grn_number?: string;

  @IsOptional()
  @IsString()
  other_information?: string;
}

export class CreateSpecificationApprovalDto {
  @IsUUID()
  specification_id: string;

  @IsUUID()
  approver_id: string;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class UpdateSpecificationApprovalDto {
  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @IsOptional()
  @IsString()
  comments?: string;
}
