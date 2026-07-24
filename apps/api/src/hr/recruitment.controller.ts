import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApplicationStatus, JobPostingStatus, RoleName } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateApplicationDto } from './dto/create-application.dto';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { RecruitmentService } from './recruitment.service';

const HR_ROLES = [RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.HR];

@Controller('hr/recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // --- Job postings ------------------------------------------------------------

  @Post('job-postings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...HR_ROLES)
  createJobPosting(@Body() dto: CreateJobPostingDto, @CurrentUser('id') userId: string) {
    return this.recruitmentService.createJobPosting(dto, userId);
  }

  @Get('job-postings')
  findAllJobPostings(@Query() pagination: PaginationDto) {
    return this.recruitmentService.findAllJobPostings(pagination);
  }

  @Get('job-postings/:id')
  findJobPosting(@Param('id') id: string) {
    return this.recruitmentService.findJobPosting(id);
  }

  @Patch('job-postings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...HR_ROLES)
  updateJobPosting(@Param('id') id: string, @Body() dto: UpdateJobPostingDto) {
    return this.recruitmentService.updateJobPosting(id, dto);
  }

  @Patch('job-postings/:id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...HR_ROLES)
  closeJobPosting(@Param('id') id: string) {
    return this.recruitmentService.updateJobPosting(id, {
      status: JobPostingStatus.CLOSED,
    });
  }

  // --- Applications (publicly submittable, e.g. from careers page) ----------------

  @Post('applications')
  createApplication(@Body() dto: CreateApplicationDto) {
    return this.recruitmentService.createApplication(dto);
  }

  @Get('applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...HR_ROLES)
  findAllApplications(
    @Query() pagination: PaginationDto,
    @Query('jobPostingId') jobPostingId?: string,
    @Query('status') status?: ApplicationStatus,
  ) {
    return this.recruitmentService.findAllApplications(pagination, { jobPostingId, status });
  }

  @Get('applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...HR_ROLES)
  findApplication(@Param('id') id: string) {
    return this.recruitmentService.findApplication(id);
  }

  @Patch('applications/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...HR_ROLES)
  updateApplicationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.recruitmentService.updateApplicationStatus(id, dto);
  }

  // --- Interviews --------------------------------------------------------------

  @Post('applications/:id/interviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...HR_ROLES)
  createInterview(@Param('id') id: string, @Body() dto: CreateInterviewDto) {
    return this.recruitmentService.createInterview(id, dto);
  }

  @Get('applications/:id/interviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...HR_ROLES)
  listInterviews(@Param('id') id: string) {
    return this.recruitmentService.listInterviews(id);
  }

  @Patch('interviews/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...HR_ROLES)
  updateInterview(@Param('id') id: string, @Body() dto: UpdateInterviewDto) {
    return this.recruitmentService.updateInterview(id, dto);
  }

  // --- Offers ------------------------------------------------------------------

  @Post('applications/:id/offer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...HR_ROLES)
  createOffer(@Param('id') id: string, @Body() dto: CreateOfferDto) {
    return this.recruitmentService.createOffer(id, dto);
  }

  @Patch('offers/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...HR_ROLES)
  updateOfferStatus(@Param('id') id: string, @Body() dto: UpdateOfferDto) {
    return this.recruitmentService.updateOfferStatus(id, dto);
  }
}
