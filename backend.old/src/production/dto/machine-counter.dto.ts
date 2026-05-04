import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class RecordMachineCounterDto {
  @IsUUID()
  job_id: string;

  @IsUUID()
  stage_history_id: string;

  @IsString()
  machine_name: string;

  @IsNumber()
  counter_start: number;

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
}
