import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BreakdownTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
