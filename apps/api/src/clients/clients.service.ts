import { Injectable } from '@nestjs/common';
import { InvoiceStatus, TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(clientId: string) {
    const [
      projects,
      invoices,
      openInvoicesAgg,
      tickets,
      upcomingMeetings,
      subscriptions,
    ] = await Promise.all([
      this.prisma.project.findMany({
        where: { clientId, deletedAt: null },
        include: {
          manager: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          milestones: { orderBy: { order: 'asc' } },
          _count: { select: { tasks: true, bugs: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.invoice.findMany({
        where: { clientId, deletedAt: null },
        orderBy: { issueDate: 'desc' },
        take: 10,
      }),
      this.prisma.invoice.aggregate({
        where: {
          clientId,
          deletedAt: null,
          status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
        },
        _sum: { total: true, amountPaid: true },
      }),
      this.prisma.ticket.findMany({
        where: { raisedById: clientId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.meeting.findMany({
        where: {
          startTime: { gte: new Date() },
          OR: [{ organizerId: clientId }, { attendees: { some: { userId: clientId } } }],
        },
        orderBy: { startTime: 'asc' },
        take: 5,
      }),
      this.prisma.subscription.findMany({ where: { clientId }, orderBy: { createdAt: 'desc' } }),
    ]);

    const allMilestones = projects.flatMap((project) =>
      project.milestones.map((milestone) => ({ ...milestone, projectName: project.name })),
    );

    const outstanding =
      Number(openInvoicesAgg._sum.total ?? 0) - Number(openInvoicesAgg._sum.amountPaid ?? 0);

    return {
      projects: {
        total: projects.length,
        active: projects.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'PLANNING')
          .length,
        items: projects,
      },
      milestones: {
        upcoming: allMilestones
          .filter((m) => !m.isCompleted)
          .sort((a, b) => (a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0))
          .slice(0, 5),
      },
      invoices: {
        recent: invoices,
        outstandingAmount: outstanding,
      },
      tickets: {
        open: tickets.filter((t) => t.status !== TicketStatus.CLOSED).length,
        recent: tickets,
      },
      upcomingMeetings,
      subscriptions,
    };
  }
}
