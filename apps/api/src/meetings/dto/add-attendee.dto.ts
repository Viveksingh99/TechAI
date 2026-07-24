import { IsNotEmpty, IsString } from 'class-validator';

export class AddAttendeeDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
