import { PartialType } from '@nestjs/mapped-types';
import { InterviewStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { CreateInterviewDto } from './create-interview.dto';

export class UpdateInterviewDto extends PartialType(CreateInterviewDto) {
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;
}
