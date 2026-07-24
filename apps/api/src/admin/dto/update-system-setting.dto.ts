import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateSystemSettingDto {
  @IsNotEmpty()
  value: unknown;

  @IsOptional()
  @IsString()
  description?: string;
}
