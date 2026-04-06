import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { DesignStatus, DesignType, ProductCategory } from '../entities/design.entity';

export class CreateDesignDto {
  @IsString()
  name: string;

  @IsEnum(DesignType)
  design_type: DesignType;

  @IsEnum(ProductCategory)
  product_category: ProductCategory;

  @IsOptional()
  @IsString()
  product_name?: string;

  @IsOptional()
  @IsUUID()
  designer_id?: string;

  @IsOptional()
  @IsString()
  specs_sheet_url?: string;

  @IsOptional()
  @IsString()
  approval_sheet_url?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateDesignDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(DesignType)
  design_type?: DesignType;

  @IsOptional()
  @IsEnum(ProductCategory)
  product_category?: ProductCategory;

  @IsOptional()
  @IsString()
  product_name?: string;

  @IsOptional()
  @IsEnum(DesignStatus)
  status?: DesignStatus;

  @IsOptional()
  @IsUUID()
  designer_id?: string;

  @IsOptional()
  @IsString()
  specs_sheet_url?: string;

  @IsOptional()
  @IsString()
  approval_sheet_url?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class DesignResponseDto {
  id: string;
  name: string;
  design_type: DesignType;
  product_category: ProductCategory;
  product_name: string;
  status: DesignStatus;
  designer_id: string;
  specs_sheet_url: string;
  approval_sheet_url: string;
  notes: string;
  created_at: Date;
  updated_at: Date;
}
