import { BugSeverity, BugStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBugDto {
  @IsOptional()
  @IsString()
  taskId?: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(BugSeverity)
  severity?: BugSeverity;

  @IsOptional()
  @IsEnum(BugStatus)
  status?: BugStatus;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsString()
  stepsToReproduce?: string;

  @IsOptional()
  @IsString()
  environment?: string;
}
