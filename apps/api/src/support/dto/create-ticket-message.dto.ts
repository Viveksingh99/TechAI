import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTicketMessageDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
