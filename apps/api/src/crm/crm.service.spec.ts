import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CrmService } from './crm.service';

type MockPrismaService = {
  lead: Record<string, jest.Mock>;
  deal: Record<string, jest.Mock>;
  pipelineStage: Record<string, jest.Mock>;
  company: Record<string, jest.Mock>;
  contact: Record<string, jest.Mock>;
  $transaction: jest.Mock;
};

describe('CrmService', () => {
  let service: CrmService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = {
      lead: {
        findFirst: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      deal: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
      },
      pipelineStage: {
        findUnique: jest.fn(),
      },
      company: { count: jest.fn() },
      contact: { count: jest.fn() },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CrmService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CrmService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('convertLeadToDeal', () => {
    it('converts a lead into a deal on the given pipeline stage', async () => {
      prisma.lead.findFirst.mockResolvedValue({
        id: 'lead-1',
        title: 'Website revamp',
        companyId: 'company-1',
        contactId: 'contact-1',
        estimatedValue: 5000,
        assignedToId: 'user-1',
        convertedDealId: null,
        deletedAt: null,
      });
      prisma.pipelineStage.findUnique.mockResolvedValue({
        id: 'stage-1',
        name: 'Qualified',
      });
      prisma.deal.create.mockResolvedValue({
        id: 'deal-1',
        title: 'Website revamp',
      });
      prisma.lead.update.mockResolvedValue({});

      const result = await service.convertLeadToDeal('lead-1', 'stage-1');

      expect(prisma.deal.create).toHaveBeenCalled();
      const dealCreateArg = prisma.deal.create.mock.calls[0]?.[0] as {
        data: { title: string; stageId: string };
      };
      expect(dealCreateArg.data.title).toBe('Website revamp');
      expect(dealCreateArg.data.stageId).toBe('stage-1');

      expect(prisma.lead.update).toHaveBeenCalled();
      const leadUpdateArg = prisma.lead.update.mock.calls[0]?.[0] as {
        where: { id: string };
        data: { status: string; convertedDealId: string };
      };
      expect(leadUpdateArg.where.id).toBe('lead-1');
      expect(leadUpdateArg.data.status).toBe('CONVERTED');
      expect(leadUpdateArg.data.convertedDealId).toBe('deal-1');
      expect(result.id).toBe('deal-1');
    });

    it('throws NotFoundException when the lead does not exist', async () => {
      prisma.lead.findFirst.mockResolvedValue(null);

      await expect(
        service.convertLeadToDeal('missing', 'stage-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('moveDealStage', () => {
    it('moves a deal to a new pipeline stage', async () => {
      prisma.deal.findUnique.mockResolvedValue({ id: 'deal-1' });
      prisma.pipelineStage.findUnique.mockResolvedValue({
        id: 'stage-2',
        name: 'Negotiation',
      });
      prisma.deal.update.mockResolvedValue({
        id: 'deal-1',
        stageId: 'stage-2',
      });

      const result = await service.moveDealStage('deal-1', {
        stageId: 'stage-2',
      });

      expect(prisma.deal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'deal-1' },
          data: { stageId: 'stage-2' },
        }),
      );
      expect(result.stageId).toBe('stage-2');
    });

    it('throws NotFoundException when the pipeline stage does not exist', async () => {
      prisma.deal.findUnique.mockResolvedValue({ id: 'deal-1' });
      prisma.pipelineStage.findUnique.mockResolvedValue(null);

      await expect(
        service.moveDealStage('deal-1', { stageId: 'missing-stage' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('salesAnalytics', () => {
    it('aggregates leads, deals, companies and contacts into a summary', async () => {
      prisma.lead.count.mockResolvedValue(10);
      prisma.lead.groupBy.mockResolvedValue([
        { status: 'NEW', _count: { _all: 4 } },
      ]);
      prisma.deal.count
        .mockResolvedValueOnce(5) // total
        .mockResolvedValueOnce(2) // open
        .mockResolvedValueOnce(2) // won
        .mockResolvedValueOnce(1); // lost
      prisma.deal.aggregate
        .mockResolvedValueOnce({ _sum: { value: 20000 } }) // won value
        .mockResolvedValueOnce({ _sum: { value: 8000 } }); // open pipeline value
      prisma.company.count.mockResolvedValue(3);
      prisma.contact.count.mockResolvedValue(7);

      const result = await service.salesAnalytics();

      expect(result.leads.total).toBe(10);
      expect(result.deals.won).toBe(2);
      expect(result.deals.wonValue).toBe(20000);
      expect(result.companies).toBe(3);
      expect(result.contacts).toBe(7);
    });
  });
});
