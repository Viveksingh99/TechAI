import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContactSubmissionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
