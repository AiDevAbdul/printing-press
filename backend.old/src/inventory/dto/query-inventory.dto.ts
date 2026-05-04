import { IsString, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryInventoryDto {
  @IsOptional()
  @IsString()
  main_category?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  gsm?: number;

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
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number;
}
