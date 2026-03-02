import { IsString, IsNumber, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { WastageType } from '../entities/wastage-record.entity';

export class RecordWastageDto {
  @IsUUID()
  job_id: string;

  @IsUUID()
  stage_history_id: string;

  @IsEnum(WastageType)
  wastage_type: WastageType;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  @IsOptional()
  estimated_cost?: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  corrective_action?: string;
}
