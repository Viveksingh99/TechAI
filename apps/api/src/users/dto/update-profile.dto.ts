import {
  IsOptional,
  IsPhoneNumber,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
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
}
