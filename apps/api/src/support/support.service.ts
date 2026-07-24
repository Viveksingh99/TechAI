import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TicketStatus } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import {
  buildSearchFilter,
  createPaginatedResult,
} from '../common/utils/pagination.util';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateTicketMessageDto } from './dto/create-ticket-message.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  avatar: true,
} satisfies Prisma.UserSelect;

const TICKET_INCLUDE = {
  raisedBy: { select: USER_SELECT },
  assignedTo: { select: USER_SELECT },
  project: { select: { id: true, name: true } },
  _count: { select: { messages: true } },
} satisfies Prisma.TicketInclude;

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async createTicket(dto: CreateTicketDto, raisedById: string) {
    return this.prisma.ticket.create({
      data: {
        ...dto,
        ticketNumber: this.generateTicketNumber(),
        raisedById,
      },
      include: TICKET_INCLUDE,
    });
  }

  async findAll(
    pagination: PaginationDto,
    filter: {
      status?: TicketStatus;
      raisedById?: string;
      assignedToId?: string;
    },
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.TicketWhereInput = {
      deletedAt: null,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.raisedById ? { raisedById: filter.raisedById } : {}),
      ...(filter.assignedToId ? { assignedToId: filter.assignedToId } : {}),
      ...buildSearchFilter(pagination.search, ['subject', 'ticketNumber']),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        include: TICKET_INCLUDE,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...TICKET_INCLUDE,
        messages: {
          include: { sender: { select: USER_SELECT } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto) {
    await this.ensureExists(id);

    return this.prisma.ticket.update({
      where: { id },
      data: dto,
      include: TICKET_INCLUDE,
    });
  }

  async assign(id: string, dto: AssignTicketDto) {
    await this.ensureExists(id);

    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: { assignedToId: dto.assignedToId },
      include: TICKET_INCLUDE,
    });

    await this.notifications.create({
      userId: dto.assignedToId,
      title: 'Ticket assigned to you',
      message: `Ticket #${ticket.ticketNumber} — ${ticket.subject}`,
      link: `/support/tickets/${ticket.id}`,
    });

    return ticket;
  }

  async updateStatus(id: string, dto: UpdateTicketStatusDto) {
    const existing = await this.ensureExists(id);

    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: {
        status: dto.status,
        resolvedAt:
          dto.status === TicketStatus.RESOLVED ||
          dto.status === TicketStatus.CLOSED
            ? new Date()
            : undefined,
      },
      include: TICKET_INCLUDE,
    });

    await this.notifications.create({
      userId: existing.raisedById,
      title: 'Ticket status updated',
      message: `Ticket #${ticket.ticketNumber} is now ${dto.status}`,
      link: `/support/tickets/${ticket.id}`,
    });

    return ticket;
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.ensureExists(id);
    await this.prisma.ticket.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Ticket deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Messages
  // ---------------------------------------------------------------------

  async addMessage(
    ticketId: string,
    dto: CreateTicketMessageDto,
    senderId: string,
  ) {
    const ticket = await this.ensureExists(ticketId);

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId,
        message: dto.message,
        attachmentUrl: dto.attachmentUrl,
      },
      include: { sender: { select: USER_SELECT } },
    });

    const notifyUserId =
      senderId === ticket.raisedById ? ticket.assignedToId : ticket.raisedById;

    if (notifyUserId) {
      await this.notifications.create({
        userId: notifyUserId,
        title: 'New reply on your ticket',
        message: `Ticket #${ticket.ticketNumber}: ${dto.message.slice(0, 120)}`,
        link: `/support/tickets/${ticket.id}`,
      });
    }

    return message;
  }

  async listMessages(ticketId: string) {
    await this.ensureExists(ticketId);

    return this.prisma.ticketMessage.findMany({
      where: { ticketId },
      include: { sender: { select: USER_SELECT } },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async ensureExists(id: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, deletedAt: null },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  private generateTicketNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();

    return `TKT-${timestamp}-${random}`;
  }
}
