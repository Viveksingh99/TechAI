import { IsNotEmpty, IsString } from 'class-validator';

export class SummarizeMeetingNotesDto {
  @IsNotEmpty()
  @IsString()
  transcript: string;
}
