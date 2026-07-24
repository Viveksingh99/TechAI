import { RoleName } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsUrl(undefined, { message: 'Avatar must be a valid URL' })
  avatar?: string;

  @IsOptional()
  @IsEnum(RoleName, { message: 'Please provide a valid role' })
  role?: RoleName;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
