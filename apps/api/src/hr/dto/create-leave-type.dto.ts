import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateLeaveTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  daysPerYear?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
