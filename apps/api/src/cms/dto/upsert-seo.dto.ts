import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpsertSeoDto {
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @IsOptional()
  @IsUrl()
  ogImage?: string;

  @IsOptional()
  @IsUrl()
  canonicalUrl?: string;
}
