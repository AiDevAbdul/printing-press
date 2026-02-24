import { IsString, IsDate, IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductionJobStatus } from '../entities/production-job.entity';

export class CreateProductionJobDto {
  @IsUUID()
  order_id: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduled_start_date?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduled_end_date?: Date;

  @IsOptional()
  @IsString()
  assigned_machine?: string;

  @IsOptional()
  @IsUUID()
  assigned_operator_id?: string;

  @IsOptional()
  @IsNumber()
  estimated_hours?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateProductionJobDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduled_start_date?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduled_end_date?: Date;

  @IsOptional()
  @IsEnum(ProductionJobStatus)
  status?: ProductionJobStatus;

  @IsOptional()
  @IsString()
  assigned_machine?: string;

  @IsOptional()
  @IsUUID()
  assigned_operator_id?: string;

  @IsOptional()
  @IsNumber()
  estimated_hours?: number;

  @IsOptional()
  @IsNumber()
  actual_hours?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateProductionJobStatusDto {
  @IsEnum(ProductionJobStatus)
  status: ProductionJobStatus;
}
