import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApprovalStatus } from '../entities/design-approval.entity';

export class CreateDesignApprovalDto {
  @IsUUID()
  design_id: string;

  @IsUUID()
  approver_id: string;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class UpdateDesignApprovalDto {
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class DesignApprovalResponseDto {
  id: string;
  design_id: string;
  approver_id: string;
  status: ApprovalStatus;
  comments: string;
  created_at: Date;
  updated_at: Date;
}
