import { RoleName } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters long and include uppercase, lowercase, a number and a symbol',
    },
  )
  password: string;

  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone?: string;

  @IsEnum(RoleName, { message: 'Please provide a valid role' })
  role: RoleName;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
