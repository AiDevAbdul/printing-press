import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { InventoryCategory, MainCategory } from '../entities/inventory-item.entity';

export class CreateInventoryItemDto {
  @IsString()
  item_code: string;

  @IsString()
  item_name: string;

  @IsOptional()
  @IsEnum(MainCategory)
  main_category?: MainCategory;

  @IsEnum(InventoryCategory)
  category: InventoryCategory;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsString()
  unit: string;

  @IsOptional()
  @IsInt()
  gsm?: number;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsNumber()
  size_length?: number;

  @IsOptional()
  @IsNumber()
  size_width?: number;

  @IsOptional()
  @IsString()
  material_type?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  current_stock?: number;

  @IsOptional()
  @IsNumber()
  reorder_level?: number;

  @IsOptional()
  @IsNumber()
  reorder_quantity?: number;

  @IsOptional()
  @IsNumber()
  unit_cost?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateInventoryItemDto {
  @IsOptional()
  @IsString()
  item_code?: string;

  @IsOptional()
  @IsString()
  item_name?: string;

  @IsOptional()
  @IsEnum(MainCategory)
  main_category?: MainCategory;

  @IsOptional()
  @IsEnum(InventoryCategory)
  category?: InventoryCategory;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsInt()
  gsm?: number;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsNumber()
  size_length?: number;

  @IsOptional()
  @IsNumber()
  size_width?: number;

  @IsOptional()
  @IsString()
  material_type?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  reorder_level?: number;

  @IsOptional()
  @IsNumber()
  reorder_quantity?: number;

  @IsOptional()
  @IsNumber()
  unit_cost?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
