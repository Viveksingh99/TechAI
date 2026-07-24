import { PartialType } from '@nestjs/mapped-types';
import { MeetingStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateMeetingDto } from './create-meeting.dto';

export class UpdateMeetingDto extends PartialType(CreateMeetingDto) {
  @IsOptional()
  @IsEnum(MeetingStatus)
  status?: MeetingStatus;
}
