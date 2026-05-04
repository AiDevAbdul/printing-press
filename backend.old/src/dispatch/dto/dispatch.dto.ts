import { IsString, IsEnum, IsOptional, IsInt, IsArray, IsUUID, IsDateString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryStatus, DeliveryType } from '../entities/delivery.entity';

// Packing List DTOs
export class CreatePackingListItemDto {
  @IsInt()
  box_number: number;

  @IsString()
  item_description: string;

  @IsInt()
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  @IsOptional()
  weight_kg?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

// Delivery DTOs
export class CreateDeliveryDto {
  @IsUUID()
  job_id: string;

  @IsUUID()
  customer_id: string;

  @IsEnum(DeliveryType)
  delivery_type: DeliveryType;

  @IsDateString()
  scheduled_date: string;

  @IsString()
  @IsOptional()
  courier_name?: string;

  @IsString()
  @IsOptional()
  tracking_number?: string;

  @IsString()
  @IsOptional()
  vehicle_number?: string;

  @IsString()
  @IsOptional()
  driver_name?: string;

  @IsString()
  @IsOptional()
  driver_phone?: string;

  @IsString()
  delivery_address: string;

  @IsString()
  @IsOptional()
  delivery_contact_name?: string;

  @IsString()
  @IsOptional()
  delivery_contact_phone?: string;

  @IsString()
  @IsOptional()
  delivery_notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePackingListItemDto)
  @IsOptional()
  packing_list?: CreatePackingListItemDto[];
}

export class UpdateDeliveryDto {
  @IsEnum(DeliveryStatus)
  @IsOptional()
  delivery_status?: DeliveryStatus;

  @IsDateString()
  @IsOptional()
  scheduled_date?: string;

  @IsString()
  @IsOptional()
  courier_name?: string;

  @IsString()
  @IsOptional()
  tracking_number?: string;

  @IsString()
  @IsOptional()
  vehicle_number?: string;

  @IsString()
  @IsOptional()
  driver_name?: string;

  @IsString()
  @IsOptional()
  driver_phone?: string;

  @IsString()
  @IsOptional()
  delivery_address?: string;

  @IsString()
  @IsOptional()
  delivery_contact_name?: string;

  @IsString()
  @IsOptional()
  delivery_contact_phone?: string;

  @IsString()
  @IsOptional()
  delivery_notes?: string;

  @IsString()
  @IsOptional()
  failure_reason?: string;
}

export class MarkAsPackedDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePackingListItemDto)
  packing_list: CreatePackingListItemDto[];
}

export class DispatchDeliveryDto {
  @IsString()
  @IsOptional()
  courier_name?: string;

  @IsString()
  @IsOptional()
  tracking_number?: string;

  @IsString()
  @IsOptional()
  vehicle_number?: string;

  @IsString()
  @IsOptional()
  driver_name?: string;

  @IsString()
  @IsOptional()
  driver_phone?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class MarkAsDeliveredDto {
  @IsString()
  received_by_name: string;

  @IsString()
  @IsOptional()
  received_by_designation?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class AddTrackingUpdateDto {
  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class GenerateChallanDto {
  @IsString()
  @IsOptional()
  terms_and_conditions?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
