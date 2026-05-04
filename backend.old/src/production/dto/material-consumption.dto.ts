import { IsString, IsNumber, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { MaterialTransactionType } from '../entities/material-consumption.entity';

export class IssueMaterialDto {
  @IsUUID()
  job_id: string;

  @IsUUID()
  @IsOptional()
  stage_history_id?: string;

  @IsString()
  material_name: string;

  @IsString()
  @IsOptional()
  material_code?: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ReturnMaterialDto {
  @IsUUID()
  job_id: string;

  @IsUUID()
  @IsOptional()
  stage_history_id?: string;

  @IsString()
  material_name: string;

  @IsString()
  @IsOptional()
  material_code?: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
