import { IsString, IsInt, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class StartWorkflowStageDto {
  @IsString()
  operator_id: string;

  @IsString()
  @IsOptional()
  machine?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class PauseWorkflowStageDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class CompleteWorkflowStageDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  waste_quantity?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  quality_approved?: boolean;
}

export class InitializeWorkflowDto {
  @IsOptional()
  has_pantone?: boolean;

  @IsOptional()
  has_uv_varnish?: boolean;

  @IsOptional()
  has_lamination?: boolean;

  @IsOptional()
  has_emboss?: boolean;

  @IsOptional()
  needs_pasting?: boolean;
}
