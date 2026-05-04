import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateDesignAttachmentDto {
  @IsUUID()
  design_id: string;

  @IsString()
  file_name: string;

  @IsString()
  file_url: string;

  @IsOptional()
  @IsString()
  file_type?: string;

  @IsOptional()
  @IsUUID()
  uploaded_by_id?: string;
}

export class DesignAttachmentResponseDto {
  id: string;
  design_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  uploaded_by_id: string;
  created_at: Date;
}
