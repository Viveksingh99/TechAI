import { DealStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CloseDealDto {
  @IsEnum(DealStatus)
  status: DealStatus;

  @IsOptional()
  @IsString()
  lostReason?: string;
}
