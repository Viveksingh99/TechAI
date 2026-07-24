import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class UpsertCaseStudyDto {
  @IsNotEmpty()
  @IsString()
  challenge: string;

  @IsNotEmpty()
  @IsString()
  solution: string;

  @IsNotEmpty()
  @IsString()
  results: string;

  @IsOptional()
  @IsObject()
  metrics?: Record<string, unknown>;
}
