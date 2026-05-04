import { IsEnum, IsNumber, IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { CostType } from '../entities/job-cost.entity';

export class CreateJobCostDto {
  @IsUUID()
  job_id: string;

  @IsEnum(CostType)
  cost_type: CostType;

  @IsOptional()
  @IsUUID()
  item_id?: string;

  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unit_cost: number;

  @IsOptional()
  @IsNumber()
  pre_press_charges?: number;
}

export class UpdateJobCostDto {
  @IsOptional()
  @IsEnum(CostType)
  cost_type?: CostType;

  @IsOptional()
  @IsUUID()
  item_id?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  unit_cost?: number;

  @IsOptional()
  @IsNumber()
  pre_press_charges?: number;
}

export class CalculateCostDto {
  @IsUUID()
  job_id: string;

  @IsOptional()
  @IsNumber()
  pre_press_charges?: number;
}

export class UpdateCostingConfigDto {
  @IsOptional()
  @IsNumber()
  paper_rate_per_kg?: number;

  @IsOptional()
  @IsNumber()
  gsm_rate_factor?: number;

  @IsOptional()
  @IsNumber()
  cmyk_base_rate?: number;

  @IsOptional()
  @IsNumber()
  special_color_rate?: number;

  @IsOptional()
  @IsNumber()
  spot_uv_rate_per_sqm?: number;

  @IsOptional()
  @IsNumber()
  lamination_rate_per_sqm?: number;

  @IsOptional()
  @IsNumber()
  embossing_rate_per_job?: number;

  @IsOptional()
  @IsNumber()
  die_cutting_rate_per_1000?: number;

  @IsOptional()
  @IsNumber()
  pre_press_simple?: number;

  @IsOptional()
  @IsNumber()
  pre_press_medium?: number;

  @IsOptional()
  @IsNumber()
  pre_press_complex?: number;

  @IsOptional()
  @IsNumber()
  pre_press_rush?: number;
}
