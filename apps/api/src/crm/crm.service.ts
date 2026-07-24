import { Injectable, NotFoundException } from '@nestjs/common';
import { DealStatus, Prisma } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import {
  buildSearchFilter,
  createPaginatedResult,
} from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CloseDealDto } from './dto/close-deal.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { CreateEmailHistoryDto } from './dto/create-email-history.dto';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { CreatePipelineStageDto } from './dto/create-pipeline-stage.dto';
import { MoveDealStageDto } from './dto/move-deal-stage.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  avatar: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------
  // Companies
  // ---------------------------------------------------------------------

  createCompany(dto: CreateCompanyDto) {
    return this.prisma.company.create({ data: dto });
  }

  async findAllCompanies(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.CompanyWhereInput = {
      deletedAt: null,
      ...buildSearchFilter(pagination.search, ['name', 'industry', 'city']),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.company.findMany({
        where,
        include: {
          _count: { select: { contacts: true, leads: true, deals: true } },
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
      }),
      this.prisma.company.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async findCompany(id: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, deletedAt: null },
      include: {
        contacts: { where: { deletedAt: null } },
        leads: { where: { deletedAt: null } },
        deals: { include: { stage: true } },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async updateCompany(id: string, dto: UpdateCompanyDto) {
    await this.ensureExists(this.prisma.company, id, 'Company');

    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async removeCompany(id: string): Promise<{ message: string }> {
    await this.ensureExists(this.prisma.company, id, 'Company');
    await this.prisma.company.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Company deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Contacts
  // ---------------------------------------------------------------------

  createContact(dto: CreateContactDto) {
    return this.prisma.contact.create({
      data: dto,
      include: { company: true },
    });
  }

  async findAllContacts(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.ContactWhereInput = {
      deletedAt: null,
      ...buildSearchFilter(pagination.search, [
        'firstName',
        'lastName',
        'email',
      ]),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.contact.findMany({
        where,
        include: { company: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async findContact(id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, deletedAt: null },
      include: {
        company: true,
        leads: true,
        deals: { include: { stage: true } },
        followUps: true,
        notes: { orderBy: { createdAt: 'desc' } },
        emails: { orderBy: { sentAt: 'desc' } },
      },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async updateContact(id: string, dto: UpdateContactDto) {
    await this.ensureExists(this.prisma.contact, id, 'Contact');

    return this.prisma.contact.update({
      where: { id },
      data: dto,
      include: { company: true },
    });
  }

  async removeContact(id: string): Promise<{ message: string }> {
    await this.ensureExists(this.prisma.contact, id, 'Contact');
    await this.prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Contact deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Leads
  // ---------------------------------------------------------------------

  createLead(dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: dto,
      include: {
        company: true,
        contact: true,
        assignedTo: { select: USER_SELECT },
      },
    });
  }

  async findAllLeads(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.LeadWhereInput = {
      deletedAt: null,
      ...buildSearchFilter(pagination.search, ['title', 'email', 'phone']),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        include: {
          company: true,
          contact: true,
          assignedTo: { select: USER_SELECT },
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async findLead(id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: null },
      include: {
        company: true,
        contact: true,
        assignedTo: { select: USER_SELECT },
        followUps: true,
        crmNotes: { orderBy: { createdAt: 'desc' } },
        emailHistory: { orderBy: { sentAt: 'desc' } },
        convertedDeal: true,
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async updateLead(id: string, dto: UpdateLeadDto) {
    await this.ensureExists(this.prisma.lead, id, 'Lead');

    return this.prisma.lead.update({
      where: { id },
      data: dto,
      include: {
        company: true,
        contact: true,
        assignedTo: { select: USER_SELECT },
      },
    });
  }

  async removeLead(id: string): Promise<{ message: string }> {
    await this.ensureExists(this.prisma.lead, id, 'Lead');
    await this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Lead deleted successfully' };
  }

  /** Converts a qualified lead into a deal on the given pipeline stage. */
  async convertLeadToDeal(id: string, stageId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: null },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    if (lead.convertedDealId) {
      throw new NotFoundException('Lead has already been converted');
    }

    const stage = await this.prisma.pipelineStage.findUnique({
      where: { id: stageId },
    });

    if (!stage) {
      throw new NotFoundException('Pipeline stage not found');
    }

    const deal = await this.prisma.deal.create({
      data: {
        title: lead.title,
        companyId: lead.companyId,
        contactId: lead.contactId,
        stageId,
        value: lead.estimatedValue ?? 0,
        ownerId: lead.assignedToId,
      },
    });

    await this.prisma.lead.update({
      where: { id },
      data: { status: 'CONVERTED', convertedDealId: deal.id },
    });

    return deal;
  }

  // ---------------------------------------------------------------------
  // Pipeline stages
  // ---------------------------------------------------------------------

  createPipelineStage(dto: CreatePipelineStageDto) {
    return this.prisma.pipelineStage.create({ data: dto });
  }

  listPipelineStages() {
    return this.prisma.pipelineStage.findMany({ orderBy: { order: 'asc' } });
  }

  // ---------------------------------------------------------------------
  // Deals
  // ---------------------------------------------------------------------

  createDeal(dto: CreateDealDto) {
    return this.prisma.deal.create({
      data: dto,
      include: {
        stage: true,
        company: true,
        contact: true,
        owner: { select: USER_SELECT },
      },
    });
  }

  async findAllDeals(
    pagination: PaginationDto,
    stageId?: string,
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.DealWhereInput = {
      deletedAt: null,
      ...(stageId ? { stageId } : {}),
      ...buildSearchFilter(pagination.search, ['title']),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.deal.findMany({
        where,
        include: {
          stage: true,
          company: true,
          contact: true,
          owner: { select: USER_SELECT },
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
      }),
      this.prisma.deal.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  /** Groups open deals by pipeline stage for a kanban-style board view. */
  async pipelineBoard() {
    const stages = await this.prisma.pipelineStage.findMany({
      orderBy: { order: 'asc' },
    });

    const deals = await this.prisma.deal.findMany({
      where: { deletedAt: null, status: DealStatus.OPEN },
      include: { company: true, contact: true, owner: { select: USER_SELECT } },
      orderBy: { updatedAt: 'desc' },
    });

    return stages.map((stage) => ({
      stage,
      deals: deals.filter((deal) => deal.stageId === stage.id),
      totalValue: deals
        .filter((deal) => deal.stageId === stage.id)
        .reduce((sum, deal) => sum + Number(deal.value), 0),
    }));
  }

  async findDeal(id: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id, deletedAt: null },
      include: {
        stage: true,
        company: true,
        contact: true,
        owner: { select: USER_SELECT },
        followUps: true,
        crmNotes: { orderBy: { createdAt: 'desc' } },
        leadRef: true,
        project: true,
      },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }

  async updateDeal(id: string, dto: UpdateDealDto) {
    await this.ensureExists(this.prisma.deal, id, 'Deal');

    return this.prisma.deal.update({
      where: { id },
      data: dto,
      include: {
        stage: true,
        company: true,
        contact: true,
        owner: { select: USER_SELECT },
      },
    });
  }

  async moveDealStage(id: string, dto: MoveDealStageDto) {
    await this.ensureExists(this.prisma.deal, id, 'Deal');

    const stage = await this.prisma.pipelineStage.findUnique({
      where: { id: dto.stageId },
    });

    if (!stage) {
      throw new NotFoundException('Pipeline stage not found');
    }

    return this.prisma.deal.update({
      where: { id },
      data: { stageId: dto.stageId },
      include: { stage: true },
    });
  }

  async closeDeal(id: string, dto: CloseDealDto) {
    await this.ensureExists(this.prisma.deal, id, 'Deal');

    return this.prisma.deal.update({
      where: { id },
      data: {
        status: dto.status,
        closedAt: new Date(),
        lostReason: dto.status === DealStatus.LOST ? dto.lostReason : undefined,
      },
    });
  }

  async removeDeal(id: string): Promise<{ message: string }> {
    await this.ensureExists(this.prisma.deal, id, 'Deal');
    await this.prisma.deal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Deal deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Follow-ups
  // ---------------------------------------------------------------------

  createFollowUp(dto: CreateFollowUpDto) {
    return this.prisma.followUp.create({ data: dto });
  }

  async findAllFollowUps(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.FollowUpWhereInput = {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.followUp.findMany({
        where,
        include: {
          lead: true,
          deal: true,
          contact: true,
          assignedTo: { select: USER_SELECT },
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.followUp.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async updateFollowUp(id: string, dto: UpdateFollowUpDto) {
    await this.ensureExists(this.prisma.followUp, id, 'Follow-up');

    return this.prisma.followUp.update({ where: { id }, data: dto });
  }

  async completeFollowUp(id: string) {
    await this.ensureExists(this.prisma.followUp, id, 'Follow-up');

    return this.prisma.followUp.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }

  async removeFollowUp(id: string): Promise<{ message: string }> {
    await this.ensureExists(this.prisma.followUp, id, 'Follow-up');
    await this.prisma.followUp.delete({ where: { id } });

    return { message: 'Follow-up deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Notes
  // ---------------------------------------------------------------------

  createNote(dto: CreateNoteDto, authorId?: string) {
    return this.prisma.crmNote.create({ data: { ...dto, authorId } });
  }

  listNotes(filter: { leadId?: string; dealId?: string; contactId?: string }) {
    return this.prisma.crmNote.findMany({
      where: filter,
      include: { author: { select: USER_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async removeNote(id: string): Promise<{ message: string }> {
    await this.ensureExists(this.prisma.crmNote, id, 'Note');
    await this.prisma.crmNote.delete({ where: { id } });

    return { message: 'Note deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Email history (stub — records outbound emails without sending them)
  // ---------------------------------------------------------------------

  createEmailHistory(dto: CreateEmailHistoryDto, sentById?: string) {
    return this.prisma.emailHistory.create({ data: { ...dto, sentById } });
  }

  listEmailHistory(filter: { leadId?: string; contactId?: string }) {
    return this.prisma.emailHistory.findMany({
      where: filter,
      include: { sentBy: { select: USER_SELECT } },
      orderBy: { sentAt: 'desc' },
    });
  }

  // ---------------------------------------------------------------------
  // Sales analytics
  // ---------------------------------------------------------------------

  async salesAnalytics() {
    const [
      totalLeads,
      leadsByStatus,
      totalDeals,
      openDeals,
      wonDeals,
      lostDeals,
      wonValueAgg,
      pipelineValueAgg,
      totalCompanies,
      totalContacts,
    ] = await Promise.all([
      this.prisma.lead.count({ where: { deletedAt: null } }),
      this.prisma.lead.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      this.prisma.deal.count({ where: { deletedAt: null } }),
      this.prisma.deal.count({
        where: { deletedAt: null, status: DealStatus.OPEN },
      }),
      this.prisma.deal.count({
        where: { deletedAt: null, status: DealStatus.WON },
      }),
      this.prisma.deal.count({
        where: { deletedAt: null, status: DealStatus.LOST },
      }),
      this.prisma.deal.aggregate({
        where: { deletedAt: null, status: DealStatus.WON },
        _sum: { value: true },
      }),
      this.prisma.deal.aggregate({
        where: { deletedAt: null, status: DealStatus.OPEN },
        _sum: { value: true },
      }),
      this.prisma.company.count({ where: { deletedAt: null } }),
      this.prisma.contact.count({ where: { deletedAt: null } }),
    ]);

    const winRate =
      totalDeals > 0
        ? Math.round((wonDeals / (wonDeals + lostDeals || 1)) * 100)
        : 0;

    return {
      leads: {
        total: totalLeads,
        byStatus: leadsByStatus.map((row) => ({
          status: row.status,
          count: row._count._all,
        })),
      },
      deals: {
        total: totalDeals,
        open: openDeals,
        won: wonDeals,
        lost: lostDeals,
        winRate,
        wonValue: Number(wonValueAgg._sum.value ?? 0),
        openPipelineValue: Number(pipelineValueAgg._sum.value ?? 0),
      },
      companies: totalCompanies,
      contacts: totalContacts,
    };
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
}
