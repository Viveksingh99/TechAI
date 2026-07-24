import { IsDateString, IsOptional } from 'class-validator';
import { CreateTimeEntryDto } from './create-time-entry.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateTimeEntryDto extends PartialType(CreateTimeEntryDto) {
  @IsOptional()
  @IsDateString()
  endTime?: string;
}
