import { PartialType } from '@nestjs/mapped-types';
import { QuotationStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateQuotationDto } from './create-quotation.dto';

export class UpdateQuotationDto extends PartialType(CreateQuotationDto) {
  @IsOptional()
  @IsEnum(QuotationStatus)
  status?: QuotationStatus;
}
