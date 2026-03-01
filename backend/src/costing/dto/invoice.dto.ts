import { IsString, IsDate, IsEnum, IsNumber, IsOptional, IsUUID, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus } from '../entities/invoice.entity';

export class InvoiceItemDto {
  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unit_price: number;
}

export class CreateInvoiceDto {
  @IsUUID()
  order_id: string;

  @IsUUID()
  customer_id: string;

  @IsDate()
  @Type(() => Date)
  invoice_date: Date;

  @IsDate()
  @Type(() => Date)
  due_date: Date;

  @IsNumber()
  subtotal: number;

  @IsOptional()
  @IsNumber()
  tax_rate?: number;

  @IsOptional()
  @IsString()
  payment_terms?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  group_name?: string;

  @IsOptional()
  @IsString()
  product_type?: string;

  @IsOptional()
  @IsNumber()
  final_quantity?: number;

  @IsOptional()
  @IsNumber()
  unit_rate?: number;

  @IsOptional()
  @IsString()
  strength?: string;

  @IsOptional()
  @IsBoolean()
  sales_tax_applicable?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  invoice_date?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  due_date?: Date;

  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  tax_rate?: number;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsString()
  payment_terms?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  group_name?: string;

  @IsOptional()
  @IsString()
  product_type?: string;

  @IsOptional()
  @IsNumber()
  final_quantity?: number;

  @IsOptional()
  @IsNumber()
  unit_rate?: number;

  @IsOptional()
  @IsString()
  strength?: string;

  @IsOptional()
  @IsBoolean()
  sales_tax_applicable?: boolean;
}

export class RecordPaymentDto {
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
