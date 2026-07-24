import { PartialType } from '@nestjs/mapped-types';
import { ReviewStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { CreatePerformanceReviewDto } from './create-performance-review.dto';

export class UpdatePerformanceReviewDto extends PartialType(
  CreatePerformanceReviewDto,
) {
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;
}
