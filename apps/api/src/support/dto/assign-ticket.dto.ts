import { IsNotEmpty, IsString } from 'class-validator';

export class AssignTicketDto {
  @IsNotEmpty()
  @IsString()
  assignedToId: string;
}
