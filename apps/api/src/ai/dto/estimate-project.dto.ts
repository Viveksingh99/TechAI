import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EstimateProjectDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  techStack?: string;
}
