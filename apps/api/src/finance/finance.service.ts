import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { createPaginatedResult } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { InvoiceItemDto } from './dto/invoice-item.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';

const CLIENT_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------
  // Invoices
  // ---------------------------------------------------------------------

  async createInvoice(dto: CreateInvoiceDto) {
    const { subtotal, total, items } = this.computeTotals(
      dto.items,
      dto.tax,
      dto.discount,
    );

    return this.prisma.invoice.create({
      data: {
        contractId: dto.contractId,
        projectId: dto.projectId,
        clientId: dto.clientId,
        invoiceNumber: this.generateNumber('INV'),
        items,
        subtotal,
        tax: dto.tax ?? 0,
        discount: dto.discount ?? 0,
        total,
        currency: dto.currency,
        dueDate: new Date(dto.dueDate),
      },
      include: { client: { select: CLIENT_SELECT } },
    });
  }

  async findAllInvoices(
    pagination: PaginationDto,
    filter: { clientId?: string; status?: InvoiceStatus },
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.InvoiceWhereInput = {
      deletedAt: null,
      ...(filter.clientId ? { clientId: filter.clientId } : {}),
      ...(filter.status ? { status: filter.status } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where,
        include: { client: { select: CLIENT_SELECT }, payments: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async findInvoice(id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, deletedAt: null },
      include: {
        client: { select: CLIENT_SELECT },
        payments: true,
        project: true,
        contract: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async updateInvoice(id: string, dto: UpdateInvoiceDto) {
    const existing = await this.ensureInvoiceExists(id);

    const items = dto.items ?? (existing.items as unknown as InvoiceItemDto[]);
    const tax = dto.tax ?? Number(existing.tax);
    const discount = dto.discount ?? Number(existing.discount);
    const {
      subtotal,
      total,
      items: computedItems,
    } = this.computeTotals(items, tax, discount);

    return this.prisma.invoice.update({
      where: { id },
      data: {
        contractId: dto.contractId,
        projectId: dto.projectId,
        clientId: dto.clientId,
        items: dto.items ? computedItems : undefined,
        subtotal: dto.items ? subtotal : undefined,
        tax: dto.tax,
        discount: dto.discount,
        total:
          dto.items || dto.tax !== undefined || dto.discount !== undefined
            ? total
            : undefined,
        currency: dto.currency,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: dto.status,
      },
      include: { client: { select: CLIENT_SELECT } },
    });
  }

  async markInvoicePaid(id: string) {
    const invoice = await this.ensureInvoiceExists(id);

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.PAID,
        amountPaid: invoice.total,
        paidAt: new Date(),
      },
    });
  }

  async removeInvoice(id: string): Promise<{ message: string }> {
    await this.ensureInvoiceExists(id);
    await this.prisma.invoice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Invoice deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Quotations
  // ---------------------------------------------------------------------

  async createQuotation(dto: CreateQuotationDto) {
    const { subtotal, total, items } = this.computeTotals(
      dto.items,
      dto.tax,
      dto.discount,
    );

    return this.prisma.quotation.create({
      data: {
        projectId: dto.projectId,
        clientId: dto.clientId,
        quotationNumber: this.generateNumber('QUO'),
        title: dto.title,
        items,
        subtotal,
        tax: dto.tax ?? 0,
        discount: dto.discount ?? 0,
        total,
        currency: dto.currency,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      },
    });
  }

  async findAllQuotations(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.QuotationWhereInput = { deletedAt: null };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.quotation.findMany({
        where,
        include: { client: { select: CLIENT_SELECT } },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quotation.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async updateQuotation(id: string, dto: UpdateQuotationDto) {
    const existing = await this.ensureQuotationExists(id);

    const items = dto.items ?? (existing.items as unknown as InvoiceItemDto[]);
    const tax = dto.tax ?? Number(existing.tax);
    const discount = dto.discount ?? Number(existing.discount);
    const {
      subtotal,
      total,
      items: computedItems,
    } = this.computeTotals(items, tax, discount);

    return this.prisma.quotation.update({
      where: { id },
      data: {
        projectId: dto.projectId,
        clientId: dto.clientId,
        title: dto.title,
        items: dto.items ? computedItems : undefined,
        subtotal: dto.items ? subtotal : undefined,
        tax: dto.tax,
        discount: dto.discount,
        total:
          dto.items || dto.tax !== undefined || dto.discount !== undefined
            ? total
            : undefined,
        currency: dto.currency,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        status: dto.status,
      },
    });
  }

  async removeQuotation(id: string): Promise<{ message: string }> {
    await this.ensureQuotationExists(id);
    await this.prisma.quotation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Quotation deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Expenses
  // ---------------------------------------------------------------------

  createExpense(dto: CreateExpenseDto, submittedById?: string) {
    return this.prisma.expense.create({
      data: {
        ...dto,
        submittedById,
        expenseDate: new Date(dto.expenseDate),
      },
    });
  }

  async findAllExpenses(
    pagination: PaginationDto,
    filter: { projectId?: string; isApproved?: boolean },
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.ExpenseWhereInput = {
      ...(filter.projectId ? { projectId: filter.projectId } : {}),
      ...(filter.isApproved !== undefined
        ? { isApproved: filter.isApproved }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.expense.findMany({
        where,
        include: {
          submittedBy: { select: CLIENT_SELECT },
          approvedBy: { select: CLIENT_SELECT },
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { expenseDate: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async updateExpense(id: string, dto: UpdateExpenseDto) {
    await this.ensureExists(this.prisma.expense, id, 'Expense');

    return this.prisma.expense.update({
      where: { id },
      data: {
        ...dto,
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
      },
    });
  }

  async approveExpense(id: string, approverId: string) {
    await this.ensureExists(this.prisma.expense, id, 'Expense');

    return this.prisma.expense.update({
      where: { id },
      data: { isApproved: true, approvedById: approverId },
    });
  }

  async removeExpense(id: string): Promise<{ message: string }> {
    await this.ensureExists(this.prisma.expense, id, 'Expense');
    await this.prisma.expense.delete({ where: { id } });

    return { message: 'Expense deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Subscriptions
  // ---------------------------------------------------------------------

  createSubscription(dto: CreateSubscriptionDto) {
    return this.prisma.subscription.create({
      data: {
        ...dto,
        nextBillingDate: dto.nextBillingDate
          ? new Date(dto.nextBillingDate)
          : undefined,
      },
    });
  }

  async findAllSubscriptions(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.SubscriptionWhereInput = {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.subscription.findMany({
        where,
        include: { client: { select: CLIENT_SELECT } },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async cancelSubscription(id: string) {
    await this.ensureExists(this.prisma.subscription, id, 'Subscription');

    return this.prisma.subscription.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
  }

  // ---------------------------------------------------------------------
  // Payments
  // ---------------------------------------------------------------------

  async recordPayment(dto: CreatePaymentDto) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, deletedAt: null },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const payment = await this.prisma.payment.create({
      data: {
        ...dto,
        status: dto.status ?? PaymentStatus.COMPLETED,
        paidAt:
          (dto.status ?? PaymentStatus.COMPLETED) === PaymentStatus.COMPLETED
            ? new Date()
            : undefined,
      },
    });

    if (payment.status === PaymentStatus.COMPLETED) {
      const amountPaid = Number(invoice.amountPaid) + Number(payment.amount);
      const isFullyPaid = amountPaid >= Number(invoice.total);

      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid,
          status: isFullyPaid
            ? InvoiceStatus.PAID
            : InvoiceStatus.PARTIALLY_PAID,
          paidAt: isFullyPaid ? new Date() : undefined,
        },
      });
    }

    return payment;
  }

  listPaymentsForInvoice(invoiceId: string) {
    return this.prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------------------------------------------------------------------
  // Contracts
  // ---------------------------------------------------------------------

  createContract(dto: CreateContractDto) {
    return this.prisma.contract.create({
      data: {
        ...dto,
        contractNumber: this.generateNumber('CON'),
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async findAllContracts(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.ContractWhereInput = { deletedAt: null };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.contract.findMany({
        where,
        include: { client: { select: CLIENT_SELECT } },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contract.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async updateContract(id: string, dto: UpdateContractDto) {
    await this.ensureExists(this.prisma.contract, id, 'Contract');

    return this.prisma.contract.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        signedAt: dto.status === 'SIGNED' ? new Date() : undefined,
      },
    });
  }

  // ---------------------------------------------------------------------
  // Dashboards
  // ---------------------------------------------------------------------

  async revenueDashboard() {
    const [
      paidAgg,
      outstandingAgg,
      overdueCount,
      subscriptionsAgg,
      invoiceCountByStatus,
    ] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { deletedAt: null, status: InvoiceStatus.PAID },
        _sum: { amountPaid: true },
      }),
      this.prisma.invoice.aggregate({
        where: {
          deletedAt: null,
          status: {
            in: [
              InvoiceStatus.SENT,
              InvoiceStatus.PARTIALLY_PAID,
              InvoiceStatus.OVERDUE,
            ],
          },
        },
        _sum: { total: true, amountPaid: true },
      }),
      this.prisma.invoice.count({
        where: { deletedAt: null, status: InvoiceStatus.OVERDUE },
      }),
      this.prisma.subscription.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { amount: true },
      }),
      this.prisma.invoice.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
    ]);

    const outstandingTotal =
      Number(outstandingAgg._sum.total ?? 0) -
      Number(outstandingAgg._sum.amountPaid ?? 0);

    return {
      totalRevenue: Number(paidAgg._sum.amountPaid ?? 0),
      outstandingAmount: outstandingTotal,
      overdueInvoices: overdueCount,
      monthlyRecurringRevenue: Number(subscriptionsAgg._sum.amount ?? 0),
      invoicesByStatus: invoiceCountByStatus.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
    };
  }

  async profitLossSummary(from?: string, to?: string) {
    const dateFilter =
      from || to
        ? {
            gte: from ? new Date(from) : undefined,
            lte: to ? new Date(to) : undefined,
          }
        : undefined;

    const [revenueAgg, expenseAgg] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: {
          deletedAt: null,
          status: InvoiceStatus.PAID,
          ...(dateFilter ? { paidAt: dateFilter } : {}),
        },
        _sum: { amountPaid: true },
      }),
      this.prisma.expense.aggregate({
        where: {
          isApproved: true,
          ...(dateFilter ? { expenseDate: dateFilter } : {}),
        },
        _sum: { amount: true },
      }),
    ]);

    const revenue = Number(revenueAgg._sum.amountPaid ?? 0);
    const expenses = Number(expenseAgg._sum.amount ?? 0);

    return {
      period: { from: from ?? null, to: to ?? null },
      revenue,
      expenses,
      profit: revenue - expenses,
      margin:
        revenue > 0 ? Math.round(((revenue - expenses) / revenue) * 100) : 0,
    };
  }

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------

  private computeTotals(items: InvoiceItemDto[], tax = 0, discount = 0) {
    const computedItems = items.map((item) => ({
      ...item,
      total: Math.round(item.quantity * item.unitPrice * 100) / 100,
    }));

    const subtotal =
      Math.round(
        computedItems.reduce((sum, item) => sum + item.total, 0) * 100,
      ) / 100;
    const total = Math.round((subtotal + tax - discount) * 100) / 100;

    return { subtotal, total, items: computedItems };
  }

  private generateNumber(prefix: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();

    return `${prefix}-${timestamp}-${random}`;
  }

  private async ensureInvoiceExists(id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, deletedAt: null },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  private async ensureQuotationExists(id: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, deletedAt: null },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    return quotation;
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
}
