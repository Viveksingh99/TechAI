import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RequestUploadSignatureDto {
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsString()
  folder?: string;
}
