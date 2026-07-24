import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateTestimonialDto {
  @IsNotEmpty()
  @IsString()
  clientName: string;

  @IsOptional()
  @IsString()
  clientDesignation?: string;

  @IsOptional()
  @IsString()
  clientCompany?: string;

  @IsOptional()
  @IsString()
  clientAvatar?: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublished?: boolean;
}
