import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsOptional()
  @IsString()
  leadId?: string;

  @IsOptional()
  @IsString()
  dealId?: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
