import { AttendeeResponse } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class RespondInviteDto {
  @IsEnum(AttendeeResponse)
  response: AttendeeResponse;
}
