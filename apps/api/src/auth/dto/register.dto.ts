import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsStrongPassword,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

function normalizePhone(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const raw = String(value).trim();
  if (!raw) return undefined;

  const digits = raw.replace(/[\s()-]/g, '');
  if (/^\d{10}$/.test(digits)) return `+91${digits}`;
  if (/^91\d{10}$/.test(digits)) return `+${digits}`;
  if (digits.startsWith('+')) return digits;
  return raw;
}

export class RegisterDto {
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

  @Transform(({ value }) => normalizePhone(value))
  @IsOptional()
  @ValidateIf((_, value) => value !== undefined && value !== null && value !== '')
  @IsPhoneNumber(undefined, {
    message: 'Please provide a valid phone number (e.g. +919155242851)',
  })
  phone?: string;
}
