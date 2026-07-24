import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReviewCodeDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  language?: string;
}
