import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateInterviewDto {
  @IsOptional()
  @IsString()
  interviewerId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  round?: number;

  @IsNotEmpty()
  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  duration?: number;

  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
