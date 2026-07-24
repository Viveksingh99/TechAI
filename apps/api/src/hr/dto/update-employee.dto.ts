import { PartialType } from '@nestjs/mapped-types';
import { OmitType } from '@nestjs/mapped-types';
import { IsDateString, IsOptional } from 'class-validator';
import { CreateEmployeeDto } from './create-employee.dto';

export class UpdateEmployeeDto extends PartialType(
  OmitType(CreateEmployeeDto, ['userId', 'employeeCode'] as const),
) {
  @IsOptional()
  @IsDateString()
  resignationDate?: string;

  @IsOptional()
  @IsDateString()
  terminationDate?: string;
}
