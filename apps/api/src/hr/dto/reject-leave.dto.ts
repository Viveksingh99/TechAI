import { IsNotEmpty, IsString } from 'class-validator';

export class RejectLeaveDto {
  @IsNotEmpty()
  @IsString()
  rejectionReason: string;
}
