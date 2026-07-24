import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateContractDto {
  @IsNotEmpty()
  @IsString()
  clientName: string;

  @IsNotEmpty()
  @IsString()
  projectTitle: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  terms?: string;
}
