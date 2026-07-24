import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertMeetingNotesDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  actionItems?: unknown[];
}
