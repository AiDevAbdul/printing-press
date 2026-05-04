import { IsString, IsNumber, IsOptional, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RecordWastageDto } from './wastage.dto';
import { RecordMachineCounterDto } from './machine-counter.dto';

export class StartStageEnhancedDto {
  @IsUUID()
  job_id: string;

  @IsString()
  stage: string;

  @IsString()
  @IsOptional()
  process?: string;

  @IsString()
  @IsOptional()
  machine?: string;

  @IsNumber()
  @IsOptional()
  counter_start?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CompleteStageEnhancedDto {
  @IsUUID()
  stage_history_id: string;

  @IsNumber()
  @IsOptional()
  counter_end?: number;

  @IsNumber()
  @IsOptional()
  good_quantity?: number;

  @IsNumber()
  @IsOptional()
  waste_quantity?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecordWastageDto)
  @IsOptional()
  wastage_records?: RecordWastageDto[];
}

export class OfflineSyncDto {
  @IsArray()
  actions: Array<{
    action_type: string;
    payload: any;
    timestamp: string;
  }>;
}
