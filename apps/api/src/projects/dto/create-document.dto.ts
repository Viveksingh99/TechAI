import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  fileUrl: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fileSize?: number;
}
