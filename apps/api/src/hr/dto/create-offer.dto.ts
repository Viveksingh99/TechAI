import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateOfferDto {
  @IsNotEmpty()
  @IsString()
  designation: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  ctc: number;

  @IsNotEmpty()
  @IsDateString()
  joiningDate: string;

  @IsOptional()
  @IsString()
  offerLetterUrl?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
