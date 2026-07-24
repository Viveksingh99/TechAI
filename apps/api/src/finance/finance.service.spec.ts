import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FinanceService } from './finance.service';

type MockPrismaService = {
  invoice: Record<string, jest.Mock>;
  payment: Record<string, jest.Mock>;
  $transaction: jest.Mock;
};

describe('FinanceService', () => {
  let service: FinanceService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = {
      invoice: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FinanceService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(FinanceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInvoice', () => {
    it('computes subtotal and total from line items, tax and discount', async () => {
      prisma.invoice.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'inv-1', ...data }),
      );

      const result = await service.createInvoice({
        clientId: 'client-1',
        items: [
          { description: 'Design', quantity: 2, unitPrice: 100 },
          { description: 'Development', quantity: 1, unitPrice: 300 },
        ],
        tax: 20,
        discount: 10,
        dueDate: '2026-12-31',
      });

      // subtotal = 2*100 + 1*300 = 500; total = 500 + 20 - 10 = 510
      expect(result.subtotal).toBe(500);
      expect(result.total).toBe(510);
      expect(prisma.invoice.create).toHaveBeenCalled();
      const createArg = prisma.invoice.create.mock.calls[0]?.[0] as {
        data: { clientId: string; subtotal: number; total: number };
      };
      expect(createArg.data.clientId).toBe('client-1');
      expect(createArg.data.subtotal).toBe(500);
      expect(createArg.data.total).toBe(510);
    });
  });

  describe('markInvoicePaid', () => {
    it('marks an invoice as fully paid', async () => {
      prisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        total: 510,
        deletedAt: null,
      });
      prisma.invoice.update.mockResolvedValue({
        id: 'inv-1',
        status: InvoiceStatus.PAID,
      });

      const result = await service.markInvoicePaid('inv-1');

      expect(prisma.invoice.update).toHaveBeenCalled();
      const paidArg = prisma.invoice.update.mock.calls[0]?.[0] as {
        where: { id: string };
        data: { status: string; amountPaid: number };
      };
      expect(paidArg.where.id).toBe('inv-1');
      expect(paidArg.data.status).toBe(InvoiceStatus.PAID);
      expect(paidArg.data.amountPaid).toBe(510);
      expect(result.status).toBe(InvoiceStatus.PAID);
    });

    it('throws NotFoundException when the invoice does not exist', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(service.markInvoicePaid('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('recordPayment', () => {
    it('records a completed payment and updates the invoice balance', async () => {
      prisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        total: 510,
        amountPaid: 0,
        deletedAt: null,
      });
      prisma.payment.create.mockResolvedValue({
        id: 'pay-1',
        invoiceId: 'inv-1',
        amount: 510,
        status: PaymentStatus.COMPLETED,
      });
      prisma.invoice.update.mockResolvedValue({});

      await service.recordPayment({ invoiceId: 'inv-1', amount: 510 });

      expect(prisma.invoice.update).toHaveBeenCalled();
      const balanceArg = prisma.invoice.update.mock.calls[0]?.[0] as {
        where: { id: string };
        data: { amountPaid: number; status: string };
      };
      expect(balanceArg.where.id).toBe('inv-1');
      expect(balanceArg.data.amountPaid).toBe(510);
      expect(balanceArg.data.status).toBe(InvoiceStatus.PAID);
    });

    it('throws NotFoundException when the invoice does not exist', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(
        service.recordPayment({ invoiceId: 'missing', amount: 100 }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
