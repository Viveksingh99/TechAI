import { ContentStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePageDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
