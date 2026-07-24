import { Module } from '@nestjs/common';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';

@Module({
  controllers: [HrController, RecruitmentController],
  providers: [HrService, RecruitmentService],
  exports: [HrService, RecruitmentService],
})
export class HrModule {}
