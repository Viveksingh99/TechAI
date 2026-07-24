import { Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationStatus, Prisma } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import {
  buildSearchFilter,
  createPaginatedResult,
} from '../common/utils/pagination.util';
import { slugify } from '../common/utils/slugify.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class RecruitmentService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------
  // Job postings
  // ---------------------------------------------------------------------

  async createJobPosting(dto: CreateJobPostingDto, postedById?: string) {
    const slug = await this.generateUniqueSlug(dto.slug ?? dto.title);

    return this.prisma.jobPosting.create({
      data: {
        ...dto,
        slug,
        postedById,
        closingDate: dto.closingDate ? new Date(dto.closingDate) : undefined,
      },
    });
  }

  async findAllJobPostings(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.JobPostingWhereInput = {
      deletedAt: null,
      ...buildSearchFilter(pagination.search, [
        'title',
        'department',
        'location',
      ]),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.jobPosting.findMany({
        where,
        include: { _count: { select: { applications: true } } },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
      }),
      this.prisma.jobPosting.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async findJobPosting(id: string) {
    const jobPosting = await this.prisma.jobPosting.findFirst({
      where: { id, deletedAt: null },
      include: { applications: { orderBy: { createdAt: 'desc' } } },
    });

    if (!jobPosting) {
      throw new NotFoundException('Job posting not found');
    }

    return jobPosting;
  }

  async updateJobPosting(id: string, dto: UpdateJobPostingDto) {
    await this.ensureJobPostingExists(id);

    return this.prisma.jobPosting.update({
      where: { id },
      data: {
        ...dto,
        slug: dto.slug ? slugify(dto.slug) : undefined,
        closingDate: dto.closingDate ? new Date(dto.closingDate) : undefined,
      },
    });
  }

  async removeJobPosting(id: string): Promise<{ message: string }> {
    await this.ensureJobPostingExists(id);
    await this.prisma.jobPosting.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Job posting deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Applications
  // ---------------------------------------------------------------------

  async createApplication(dto: CreateApplicationDto) {
    const jobPosting = await this.prisma.jobPosting.findFirst({
      where: { id: dto.jobPostingId, deletedAt: null },
    });

    if (!jobPosting) {
      throw new NotFoundException('Job posting not found');
    }

    return this.prisma.application.create({ data: dto });
  }

  async findAllApplications(
    pagination: PaginationDto,
    filter: { jobPostingId?: string; status?: ApplicationStatus },
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.ApplicationWhereInput = {
      ...(filter.jobPostingId ? { jobPostingId: filter.jobPostingId } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...buildSearchFilter(pagination.search, ['fullName', 'email']),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.application.findMany({
        where,
        include: { jobPosting: { select: { id: true, title: true } } },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.application.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async findApplication(id: string) {
    const application = await this.prisma.application.findFirst({
      where: { id },
      include: {
        jobPosting: true,
        interviews: { orderBy: { scheduledAt: 'asc' } },
        offer: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async updateApplicationStatus(id: string, dto: UpdateApplicationStatusDto) {
    await this.ensureApplicationExists(id);

    return this.prisma.application.update({
      where: { id },
      data: { status: dto.status, notes: dto.notes },
    });
  }

  // ---------------------------------------------------------------------
  // Interviews
  // ---------------------------------------------------------------------

  async createInterview(applicationId: string, dto: CreateInterviewDto) {
    await this.ensureApplicationExists(applicationId);

    return this.prisma.interview.create({
      data: {
        applicationId,
        interviewerId: dto.interviewerId,
        round: dto.round,
        scheduledAt: new Date(dto.scheduledAt),
        duration: dto.duration,
        mode: dto.mode,
        location: dto.location,
      },
    });
  }

  listInterviews(applicationId: string) {
    return this.prisma.interview.findMany({
      where: { applicationId },
      include: {
        interviewer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async updateInterview(id: string, dto: UpdateInterviewDto) {
    await this.ensureExists(this.prisma.interview, id, 'Interview');

    return this.prisma.interview.update({
      where: { id },
      data: {
        interviewerId: dto.interviewerId,
        round: dto.round,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        duration: dto.duration,
        mode: dto.mode,
        location: dto.location,
        status: dto.status,
        feedback: dto.feedback,
        rating: dto.rating,
      },
    });
  }

  // ---------------------------------------------------------------------
  // Offers
  // ---------------------------------------------------------------------

  async createOffer(applicationId: string, dto: CreateOfferDto) {
    await this.ensureApplicationExists(applicationId);

    const existing = await this.prisma.offer.findUnique({
      where: { applicationId },
    });

    if (existing) {
      throw new NotFoundException(
        'An offer already exists for this application',
      );
    }

    return this.prisma.offer.create({
      data: {
        applicationId,
        designation: dto.designation,
        ctc: dto.ctc,
        joiningDate: new Date(dto.joiningDate),
        offerLetterUrl: dto.offerLetterUrl,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async updateOfferStatus(id: string, dto: UpdateOfferDto) {
    await this.ensureExists(this.prisma.offer, id, 'Offer');

    const offer = await this.prisma.offer.update({
      where: { id },
      data: { status: dto.status },
    });

    if (dto.status === 'ACCEPTED') {
      await this.prisma.application.update({
        where: { id: offer.applicationId },
        data: { status: ApplicationStatus.HIRED },
      });
    }

    return offer;
  }

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------

  private async ensureJobPostingExists(id: string): Promise<void> {
    const jobPosting = await this.prisma.jobPosting.findFirst({
      where: { id, deletedAt: null },
    });

    if (!jobPosting) {
      throw new NotFoundException('Job posting not found');
    }
  }

  private async ensureApplicationExists(id: string): Promise<void> {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }
  }

  private async ensureExists(
    delegate: {
      findUnique: (args: { where: { id: string } }) => Promise<unknown>;
    },
    id: string,
    label: string,
  ): Promise<void> {
    const record = await delegate.findUnique({ where: { id } });

    if (!record) {
      throw new NotFoundException(`${label} not found`);
    }
  }

  private async generateUniqueSlug(source: string): Promise<string> {
    const base = slugify(source);
    const existing = await this.prisma.jobPosting.findUnique({
      where: { slug: base },
    });

    return existing ? slugify(source, true) : base;
  }
}
