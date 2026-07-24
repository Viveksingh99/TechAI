import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoleName, SubmissionStatus } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateConsultationBookingDto } from './dto/create-consultation-booking.dto';
import { CreateContactSubmissionDto } from './dto/create-contact-submission.dto';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { PublicService } from './public.service';

const CMS_ROLES = [RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES];

@Controller('cms/public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  // --- Newsletter --------------------------------------------------------------

  @Post('newsletter/subscribe')
  @HttpCode(HttpStatus.OK)
  subscribeNewsletter(@Body() dto: SubscribeNewsletterDto) {
    return this.publicService.subscribeNewsletter(dto);
  }

  @Patch('newsletter/unsubscribe')
  unsubscribeNewsletter(@Body() dto: SubscribeNewsletterDto) {
    return this.publicService.unsubscribeNewsletter(dto.email);
  }

  @Get('newsletter/subscribers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  listNewsletterSubscribers(@Query() pagination: PaginationDto) {
    return this.publicService.listNewsletterSubscribers(pagination);
  }

  // --- Contact submissions -------------------------------------------------------

  @Post('contact')
  createContactSubmission(@Body() dto: CreateContactSubmissionDto) {
    return this.publicService.createContactSubmission(dto);
  }

  @Get('contact')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  listContactSubmissions(@Query() pagination: PaginationDto) {
    return this.publicService.listContactSubmissions(pagination);
  }

  @Patch('contact/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  updateContactSubmissionStatus(
    @Param('id') id: string,
    @Body('status') status: SubmissionStatus,
  ) {
    return this.publicService.updateContactSubmissionStatus(id, status);
  }

  // --- Consultation bookings -----------------------------------------------------

  @Post('consultations')
  createConsultationBooking(@Body() dto: CreateConsultationBookingDto) {
    return this.publicService.createConsultationBooking(dto);
  }

  @Get('consultations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  listConsultationBookings(@Query() pagination: PaginationDto) {
    return this.publicService.listConsultationBookings(pagination);
  }

  @Patch('consultations/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CMS_ROLES)
  updateBookingStatus(@Param('id') id: string, @Body() dto: UpdateBookingStatusDto) {
    return this.publicService.updateBookingStatus(id, dto);
  }
}
