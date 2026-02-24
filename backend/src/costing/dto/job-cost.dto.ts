import { IsEnum, IsNumber, IsString, IsOptional, IsUUID } from 'class-validator';
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
}
