import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateProposalDto {
  @IsNotEmpty()
  @IsString()
  clientName: string;

  @IsNotEmpty()
  @IsString()
  projectSummary: string;

  @IsOptional()
  @IsString()
  budget?: string;

  @IsOptional()
  @IsString()
  timeline?: string;

  @IsOptional()
  @IsString()
  scope?: string;
}
