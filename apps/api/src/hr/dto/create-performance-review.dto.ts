import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreatePerformanceReviewDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsString()
  reviewerId: string;

  @IsNotEmpty()
  @IsDateString()
  reviewPeriodStart: string;

  @IsNotEmpty()
  @IsDateString()
  reviewPeriodEnd: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  strengths?: string;

  @IsOptional()
  @IsString()
  improvements?: string;

  @IsOptional()
  @IsString()
  goals?: string;
}
