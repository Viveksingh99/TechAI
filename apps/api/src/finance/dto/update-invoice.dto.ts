import { PartialType } from '@nestjs/mapped-types';
import { InvoiceStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateInvoiceDto } from './create-invoice.dto';

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;
}
