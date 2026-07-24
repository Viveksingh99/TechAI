import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WriteEmailDto {
  @IsNotEmpty()
  @IsString()
  purpose: string;

  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsString()
  context?: string;
}
