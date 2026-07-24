import { IsNotEmpty, IsString } from 'class-validator';

export class MoveDealStageDto {
  @IsNotEmpty()
  @IsString()
  stageId: string;
}
