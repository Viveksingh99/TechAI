import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SubmissionStatus } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { createPaginatedResult } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsultationBookingDto } from './dto/create-consultation-booking.dto';
import { CreateContactSubmissionDto } from './dto/create-contact-submission.dto';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------
  // Newsletter
  // ---------------------------------------------------------------------

  async subscribeNewsletter(dto: SubscribeNewsletterDto) {
    return this.prisma.newsletterSubscriber.upsert({
      where: { email: dto.email },
      create: { email: dto.email },
      update: { isActive: true, unsubscribedAt: null },
    });
  }

  async unsubscribeNewsletter(email: string): Promise<{ message: string }> {
    await this.prisma.newsletterSubscriber.update({
      where: { email },
      data: { isActive: false, unsubscribedAt: new Date() },
    });

    return { message: 'Unsubscribed successfully' };
  }

  async listNewsletterSubscribers(pagination: PaginationDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.NewsletterSubscriberWhereInput = {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.newsletterSubscriber.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { subscribedAt: 'desc' },
      }),
      this.prisma.newsletterSubscriber.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  // ---------------------------------------------------------------------
  // Contact submissions
  // ---------------------------------------------------------------------

  createContactSubmission(dto: CreateContactSubmissionDto) {
    return this.prisma.contactSubmission.create({ data: dto });
  }

  async listContactSubmissions(pagination: PaginationDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.ContactSubmissionWhereInput = {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.contactSubmission.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contactSubmission.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async updateContactSubmissionStatus(id: string, status: SubmissionStatus) {
    const submission = await this.prisma.contactSubmission.findUnique({ where: { id } });

    if (!submission) {
      throw new NotFoundException('Contact submission not found');
    }

    return this.prisma.contactSubmission.update({
      where: { id },
      data: { status },
    });
  }

  // ---------------------------------------------------------------------
  // Consultation bookings
  // ---------------------------------------------------------------------

  createConsultationBooking(dto: CreateConsultationBookingDto) {
    return this.prisma.consultationBooking.create({
      data: { ...dto, preferredDate: new Date(dto.preferredDate) },
    });
  }

  async listConsultationBookings(pagination: PaginationDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.ConsultationBookingWhereInput = {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.consultationBooking.findMany({
        where,
        include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { preferredDate: 'asc' },
      }),
      this.prisma.consultationBooking.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async updateBookingStatus(id: string, dto: UpdateBookingStatusDto) {
    const booking = await this.prisma.consultationBooking.findUnique({ where: { id } });

    if (!booking) {
      throw new NotFoundException('Consultation booking not found');
    }

    return this.prisma.consultationBooking.update({
      where: { id },
      data: { status: dto.status, assignedToId: dto.assignedToId },
    });
  }
}
