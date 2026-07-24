import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateConsultationBookingDto {
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
  company?: string;

  @IsOptional()
  @IsString()
  serviceInterested?: string;

  @IsNotEmpty()
  @IsDateString()
  preferredDate: string;

  @IsOptional()
  @IsString()
  message?: string;
}
