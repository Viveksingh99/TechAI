import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { InvoiceItemDto } from './invoice-item.dto';

export class CreateInvoiceDto {
  @IsOptional()
  @IsString()
  contractId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsNotEmpty()
  @IsString()
  clientId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsNotEmpty()
  @IsDateString()
  dueDate: string;
}
