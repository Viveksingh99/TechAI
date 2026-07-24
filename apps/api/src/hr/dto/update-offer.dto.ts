import { OfferStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateOfferDto {
  @IsEnum(OfferStatus)
  status: OfferStatus;
}
