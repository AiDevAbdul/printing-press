import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApprovalStatus } from '../entities/stage-approval.entity';

export class ApproveStageDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectStageDto {
  @IsString()
  rejection_reason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateStageApprovalDto {
  @IsOptional()
  @IsNumber()
  inline_item_id?: number;

  @IsOptional()
  @IsString()
  job_id?: string;

  @IsString()
  stage_name: string;
}
