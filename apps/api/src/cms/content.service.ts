import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { slugify } from '../common/utils/slugify.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { UpdatePortfolioItemDto } from './dto/update-portfolio-item.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { UpsertCaseStudyDto } from './dto/upsert-case-study.dto';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------
  // FAQs
  // ---------------------------------------------------------------------

  createFaq(dto: CreateFaqDto) {
    return this.prisma.faq.create({ data: dto });
  }

  listFaqs(category?: string) {
    return this.prisma.faq.findMany({
      where: category ? { category } : undefined,
      orderBy: { order: 'asc' },
    });
  }

  async updateFaq(id: string, dto: UpdateFaqDto) {
    await this.ensureExists(this.prisma.faq, id, 'FAQ');

    return this.prisma.faq.update({ where: { id }, data: dto });
  }

  async removeFaq(id: string): Promise<{ message: string }> {
    await this.ensureExists(this.prisma.faq, id, 'FAQ');
    await this.prisma.faq.delete({ where: { id } });

    return { message: 'FAQ deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Testimonials
  // ---------------------------------------------------------------------

  createTestimonial(dto: CreateTestimonialDto) {
    return this.prisma.testimonial.create({ data: dto });
  }

  listTestimonials(publishedOnly = false) {
    return this.prisma.testimonial.findMany({
      where: publishedOnly ? { isPublished: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTestimonial(id: string, dto: UpdateTestimonialDto) {
    await this.ensureExists(this.prisma.testimonial, id, 'Testimonial');

    return this.prisma.testimonial.update({ where: { id }, data: dto });
  }

  async removeTestimonial(id: string): Promise<{ message: string }> {
    await this.ensureExists(this.prisma.testimonial, id, 'Testimonial');
    await this.prisma.testimonial.delete({ where: { id } });

    return { message: 'Testimonial deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Portfolio items + case studies
  // ---------------------------------------------------------------------

  async createPortfolioItem(dto: CreatePortfolioItemDto) {
    const slug = await this.generateUniquePortfolioSlug(dto.slug ?? dto.title);

    return this.prisma.portfolioItem.create({ data: { ...dto, slug } });
  }

  listPortfolioItems() {
    return this.prisma.portfolioItem.findMany({
      where: { deletedAt: null },
      include: { caseStudy: true },
      orderBy: { order: 'asc' },
    });
  }

  async findPortfolioItem(id: string) {
    const item = await this.prisma.portfolioItem.findFirst({
      where: { id, deletedAt: null },
      include: { caseStudy: true },
    });

    if (!item) {
      throw new NotFoundException('Portfolio item not found');
    }

    return item;
  }

  async updatePortfolioItem(id: string, dto: UpdatePortfolioItemDto) {
    await this.ensureExists(this.prisma.portfolioItem, id, 'Portfolio item');

    return this.prisma.portfolioItem.update({
      where: { id },
      data: { ...dto, slug: dto.slug ? slugify(dto.slug) : undefined },
    });
  }

  async removePortfolioItem(id: string): Promise<{ message: string }> {
    await this.ensureExists(this.prisma.portfolioItem, id, 'Portfolio item');
    await this.prisma.portfolioItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Portfolio item deleted successfully' };
  }

  upsertCaseStudy(portfolioItemId: string, dto: UpsertCaseStudyDto) {
    return this.prisma.caseStudy.upsert({
      where: { portfolioItemId },
      create: {
        portfolioItemId,
        ...dto,
      } as Prisma.CaseStudyUncheckedCreateInput,
      update: dto as Prisma.CaseStudyUncheckedUpdateInput,
    });
  }

  // ---------------------------------------------------------------------
  // Team members
  // ---------------------------------------------------------------------

  createTeamMember(dto: CreateTeamMemberDto) {
    return this.prisma.teamMember.create({ data: dto });
  }

  listTeamMembers(publishedOnly = false) {
    return this.prisma.teamMember.findMany({
      where: publishedOnly ? { isPublished: true } : undefined,
      orderBy: { order: 'asc' },
    });
  }

  async updateTeamMember(id: string, dto: UpdateTeamMemberDto) {
    await this.ensureExists(this.prisma.teamMember, id, 'Team member');

    return this.prisma.teamMember.update({ where: { id }, data: dto });
  }

  async removeTeamMember(id: string): Promise<{ message: string }> {
    await this.ensureExists(this.prisma.teamMember, id, 'Team member');
    await this.prisma.teamMember.delete({ where: { id } });

    return { message: 'Team member deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Services
  // ---------------------------------------------------------------------

  async createService(dto: CreateServiceDto) {
    const slug = await this.generateUniqueServiceSlug(dto.slug ?? dto.title);

    return this.prisma.service.create({ data: { ...dto, slug } });
  }

  listServices(publishedOnly = false) {
    return this.prisma.service.findMany({
      where: publishedOnly ? { isPublished: true } : undefined,
      orderBy: { order: 'asc' },
    });
  }

  async updateService(id: string, dto: UpdateServiceDto) {
    await this.ensureExists(this.prisma.service, id, 'Service');

    return this.prisma.service.update({
      where: { id },
      data: { ...dto, slug: dto.slug ? slugify(dto.slug) : undefined },
    });
  }

  async removeService(id: string): Promise<{ message: string }> {
    await this.ensureExists(this.prisma.service, id, 'Service');
    await this.prisma.service.delete({ where: { id } });

    return { message: 'Service deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------

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

  private async generateUniquePortfolioSlug(source: string): Promise<string> {
    const base = slugify(source);
    const existing = await this.prisma.portfolioItem.findUnique({
      where: { slug: base },
    });

    return existing ? slugify(source, true) : base;
  }

  private async generateUniqueServiceSlug(source: string): Promise<string> {
    const base = slugify(source);
    const existing = await this.prisma.service.findUnique({
      where: { slug: base },
    });

    return existing ? slugify(source, true) : base;
  }
}
