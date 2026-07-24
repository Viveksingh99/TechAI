import { TaskStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;
}
