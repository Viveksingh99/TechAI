import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from './projects.service';

type MockPrismaService = {
  project: Record<string, jest.Mock>;
  task: Record<string, jest.Mock>;
  activityLog: Record<string, jest.Mock>;
  $transaction: jest.Mock;
};

function buildProject(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'project-1',
    name: 'TechAI Website Revamp',
    slug: 'techai-website-revamp',
    deletedAt: null,
    ...overrides,
  };
}

function buildTask(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'task-1',
    projectId: 'project-1',
    title: 'Design homepage',
    status: TaskStatus.TODO,
    deletedAt: null,
    ...overrides,
  };
}

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = {
      project: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      task: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      activityLog: {
        create: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('generates a slug from the project name and creates the project', async () => {
      prisma.project.findUnique.mockResolvedValue(null);
      prisma.project.create.mockResolvedValue(buildProject());

      const result = await service.create({ name: 'TechAI Website Revamp' });

      expect(prisma.project.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'TechAI Website Revamp',
            slug: 'techai-website-revamp',
          }),
        }),
      );
      expect(result.name).toBe('TechAI Website Revamp');
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when the project does not exist', async () => {
      prisma.project.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateTaskStatus', () => {
    it('moves a task to a new kanban status and logs project activity', async () => {
      prisma.project.findFirst.mockResolvedValue(buildProject());
      prisma.task.findFirst.mockResolvedValue(buildTask());
      prisma.task.update.mockResolvedValue(buildTask({ status: TaskStatus.IN_PROGRESS }));

      const result = await service.updateTaskStatus(
        'project-1',
        'task-1',
        { status: TaskStatus.IN_PROGRESS },
        'user-1',
      );

      expect(prisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task-1' },
          data: { status: TaskStatus.IN_PROGRESS, order: undefined },
        }),
      );
      expect(prisma.activityLog.create).toHaveBeenCalled();
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('throws NotFoundException when the task does not belong to the project', async () => {
      prisma.project.findFirst.mockResolvedValue(buildProject());
      prisma.task.findFirst.mockResolvedValue(null);

      await expect(
        service.updateTaskStatus('project-1', 'missing-task', { status: TaskStatus.DONE }, 'user-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
