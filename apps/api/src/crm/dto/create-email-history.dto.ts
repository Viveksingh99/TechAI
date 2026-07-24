import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEmailHistoryDto {
  @IsOptional()
  @IsString()
  leadId?: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsNotEmpty()
  @IsEmail()
  toEmail: string;
}
