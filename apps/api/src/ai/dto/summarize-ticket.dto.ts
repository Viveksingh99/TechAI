import { IsNotEmpty, IsString } from 'class-validator';

export class SummarizeTicketDto {
  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  conversation: string;
}
