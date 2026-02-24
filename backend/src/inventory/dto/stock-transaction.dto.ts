import { IsEnum, IsNumber, IsString, IsOptional, IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType, ReferenceType } from '../entities/stock-transaction.entity';

export class CreateStockTransactionDto {
  @IsEnum(TransactionType)
  transaction_type: TransactionType;

  @IsUUID()
  item_id: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  unit_cost?: number;

  @IsEnum(ReferenceType)
  reference_type: ReferenceType;

  @IsOptional()
  @IsUUID()
  reference_id?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDate()
  @Type(() => Date)
  transaction_date: Date;
}
