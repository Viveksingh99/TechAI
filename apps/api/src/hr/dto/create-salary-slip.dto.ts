import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateSalarySlipDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basicSalary: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  allowances?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  deductions?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bonus?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
