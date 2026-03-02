import { IsString, IsEnum, IsOptional, IsInt, IsBoolean, IsArray, IsUUID, IsNumber } from 'class-validator';
import { CheckpointType, CheckpointSeverity } from '../entities/quality-checkpoint.entity';
import { InspectionStatus } from '../entities/quality-inspection.entity';
import { DefectCategory, DefectSeverity } from '../entities/quality-defect.entity';
import { RejectionDisposition } from '../entities/quality-rejection.entity';
import { ComplaintStatus, ComplaintSeverity } from '../entities/customer-complaint.entity';

// Quality Checkpoint DTOs
export class CreateCheckpointDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CheckpointType)
  stage: CheckpointType;

  @IsEnum(CheckpointSeverity)
  @IsOptional()
  severity?: CheckpointSeverity;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  checklist_items?: string[];

  @IsInt()
  @IsOptional()
  sequence_order?: number;
}

export class UpdateCheckpointDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CheckpointSeverity)
  @IsOptional()
  severity?: CheckpointSeverity;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  checklist_items?: string[];

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsInt()
  @IsOptional()
  sequence_order?: number;
}

// Quality Inspection DTOs
export class CreateInspectionDto {
  @IsUUID()
  job_id: string;

  @IsUUID()
  @IsOptional()
  stage_history_id?: string;

  @IsUUID()
  checkpoint_id: string;

  @IsInt()
  @IsOptional()
  sample_size?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateInspectionDto {
  @IsEnum(InspectionStatus)
  @IsOptional()
  status?: InspectionStatus;

  @IsInt()
  @IsOptional()
  defects_found?: number;

  @IsOptional()
  checklist_results?: Record<string, boolean>;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  failure_reason?: string;
}

export class PassInspectionDto {
  @IsOptional()
  checklist_results?: Record<string, boolean>;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class FailInspectionDto {
  @IsString()
  failure_reason: string;

  @IsInt()
  @IsOptional()
  defects_found?: number;

  @IsOptional()
  checklist_results?: Record<string, boolean>;

  @IsString()
  @IsOptional()
  notes?: string;
}

// Quality Defect DTOs
export class CreateDefectDto {
  @IsUUID()
  inspection_id: string;

  @IsEnum(DefectCategory)
  category: DefectCategory;

  @IsEnum(DefectSeverity)
  severity: DefectSeverity;

  @IsString()
  description: string;

  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  root_cause?: string;

  @IsString()
  @IsOptional()
  corrective_action?: string;
}

export class UpdateDefectDto {
  @IsEnum(DefectCategory)
  @IsOptional()
  category?: DefectCategory;

  @IsEnum(DefectSeverity)
  @IsOptional()
  severity?: DefectSeverity;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  root_cause?: string;

  @IsString()
  @IsOptional()
  corrective_action?: string;
}

// Quality Rejection DTOs
export class CreateRejectionDto {
  @IsUUID()
  job_id: string;

  @IsInt()
  rejected_quantity: number;

  @IsString()
  unit: string;

  @IsString()
  reason: string;

  @IsEnum(RejectionDisposition)
  disposition: RejectionDisposition;

  @IsNumber()
  @IsOptional()
  estimated_loss?: number;

  @IsString()
  @IsOptional()
  corrective_action?: string;
}

export class UpdateRejectionDto {
  @IsEnum(RejectionDisposition)
  @IsOptional()
  disposition?: RejectionDisposition;

  @IsNumber()
  @IsOptional()
  estimated_loss?: number;

  @IsString()
  @IsOptional()
  corrective_action?: string;

  @IsBoolean()
  @IsOptional()
  is_resolved?: boolean;
}

// Customer Complaint DTOs
export class CreateComplaintDto {
  @IsUUID()
  customer_id: string;

  @IsUUID()
  @IsOptional()
  job_id?: string;

  @IsString()
  subject: string;

  @IsString()
  description: string;

  @IsEnum(ComplaintSeverity)
  @IsOptional()
  severity?: ComplaintSeverity;

  @IsUUID()
  @IsOptional()
  assigned_to_id?: string;
}

export class UpdateComplaintDto {
  @IsEnum(ComplaintStatus)
  @IsOptional()
  status?: ComplaintStatus;

  @IsEnum(ComplaintSeverity)
  @IsOptional()
  severity?: ComplaintSeverity;

  @IsString()
  @IsOptional()
  root_cause_analysis?: string;

  @IsString()
  @IsOptional()
  corrective_action?: string;

  @IsString()
  @IsOptional()
  preventive_action?: string;

  @IsString()
  @IsOptional()
  resolution_notes?: string;

  @IsUUID()
  @IsOptional()
  assigned_to_id?: string;
}

export class ResolveComplaintDto {
  @IsString()
  resolution_notes: string;

  @IsString()
  @IsOptional()
  corrective_action?: string;

  @IsString()
  @IsOptional()
  preventive_action?: string;
}
