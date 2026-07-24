import { ProjectMemberRole } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddMemberDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(ProjectMemberRole)
  role?: ProjectMemberRole;
}
