import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TaskStatus } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import {
  buildSearchFilter,
  createPaginatedResult,
} from '../common/utils/pagination.util';
import { slugify } from '../common/utils/slugify.util';
import { PrismaService } from '../prisma/prisma.service';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateBugDto } from './dto/create-bug.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateBugDto } from './dto/update-bug.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';

const PROJECT_INCLUDE = {
  client: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  manager: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  members: {
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
      },
    },
  },
  _count: {
    select: { tasks: true, bugs: true, milestones: true, sprints: true },
  },
} satisfies Prisma.ProjectInclude;

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------
  // Projects
  // ---------------------------------------------------------------------

  async create(dto: CreateProjectDto) {
    const slug = await this.generateUniqueSlug(dto.slug ?? dto.name);

    return this.prisma.project.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        clientId: dto.clientId,
        dealId: dto.dealId,
        managerId: dto.managerId,
        status: dto.status,
        priority: dto.priority,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        budget: dto.budget,
      },
      include: PROJECT_INCLUDE,
    });
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.ProjectWhereInput = {
      deletedAt: null,
      ...buildSearchFilter(pagination.search, ['name', 'description']),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        include: PROJECT_INCLUDE,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
      }),
      this.prisma.project.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...PROJECT_INCLUDE,
        milestones: { orderBy: { order: 'asc' } },
        sprints: { orderBy: { startDate: 'desc' } },
        documents: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.ensureProjectExists(id);

    return this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug ? slugify(dto.slug) : undefined,
        description: dto.description,
        clientId: dto.clientId,
        dealId: dto.dealId,
        managerId: dto.managerId,
        status: dto.status,
        priority: dto.priority,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        budget: dto.budget,
        progress: dto.progress,
      },
      include: PROJECT_INCLUDE,
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.ensureProjectExists(id);

    await this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Project deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Members
  // ---------------------------------------------------------------------

  async addMember(projectId: string, dto: AddMemberDto) {
    await this.ensureProjectExists(projectId);

    return this.prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId: dto.userId } },
      create: { projectId, userId: dto.userId, role: dto.role },
      update: { role: dto.role },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async listMembers(projectId: string) {
    await this.ensureProjectExists(projectId);

    return this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async removeMember(
    projectId: string,
    userId: string,
  ): Promise<{ message: string }> {
    await this.ensureProjectExists(projectId);

    await this.prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });

    return { message: 'Member removed from project' };
  }

  // ---------------------------------------------------------------------
  // Milestones
  // ---------------------------------------------------------------------

  async createMilestone(projectId: string, dto: CreateMilestoneDto) {
    await this.ensureProjectExists(projectId);

    return this.prisma.milestone.create({
      data: {
        projectId,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        isCompleted: dto.isCompleted,
        order: dto.order,
      },
    });
  }

  async listMilestones(projectId: string) {
    await this.ensureProjectExists(projectId);

    return this.prisma.milestone.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });
  }

  async updateMilestone(
    projectId: string,
    id: string,
    dto: UpdateMilestoneDto,
  ) {
    await this.ensureMilestoneExists(projectId, id);

    return this.prisma.milestone.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        isCompleted: dto.isCompleted,
        completedAt: dto.isCompleted ? new Date() : undefined,
        order: dto.order,
      },
    });
  }

  async removeMilestone(
    projectId: string,
    id: string,
  ): Promise<{ message: string }> {
    await this.ensureMilestoneExists(projectId, id);
    await this.prisma.milestone.delete({ where: { id } });

    return { message: 'Milestone deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Sprints
  // ---------------------------------------------------------------------

  async createSprint(projectId: string, dto: CreateSprintDto) {
    await this.ensureProjectExists(projectId);

    return this.prisma.sprint.create({
      data: {
        projectId,
        name: dto.name,
        goal: dto.goal,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status,
      },
    });
  }

  async listSprints(projectId: string) {
    await this.ensureProjectExists(projectId);

    return this.prisma.sprint.findMany({
      where: { projectId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { startDate: 'desc' },
    });
  }

  async updateSprint(projectId: string, id: string, dto: UpdateSprintDto) {
    await this.ensureSprintExists(projectId, id);

    return this.prisma.sprint.update({
      where: { id },
      data: {
        name: dto.name,
        goal: dto.goal,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status,
      },
    });
  }

  async removeSprint(
    projectId: string,
    id: string,
  ): Promise<{ message: string }> {
    await this.ensureSprintExists(projectId, id);
    await this.prisma.sprint.delete({ where: { id } });

    return { message: 'Sprint deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Tasks (kanban)
  // ---------------------------------------------------------------------

  async createTask(projectId: string, dto: CreateTaskDto, reporterId?: string) {
    await this.ensureProjectExists(projectId);

    const task = await this.prisma.task.create({
      data: {
        projectId,
        sprintId: dto.sprintId,
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        assigneeId: dto.assigneeId,
        reporterId: dto.reporterId ?? reporterId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        estimatedHours: dto.estimatedHours,
        tags: dto.tags,
      },
      include: this.taskInclude(),
    });

    await this.logActivity(
      projectId,
      reporterId,
      'TASK_CREATED',
      `Task "${task.title}" created`,
    );

    return task;
  }

  async listTasks(projectId: string, status?: TaskStatus) {
    await this.ensureProjectExists(projectId);

    return this.prisma.task.findMany({
      where: {
        projectId,
        deletedAt: null,
        ...(status ? { status } : {}),
      },
      include: this.taskInclude(),
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findTask(projectId: string, id: string) {
    return this.ensureTaskExists(projectId, id, {
      ...this.taskInclude(),
      comments: {
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    });
  }

  async updateTask(
    projectId: string,
    id: string,
    dto: UpdateTaskDto,
    userId?: string,
  ) {
    await this.ensureTaskExists(projectId, id);

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        sprintId: dto.sprintId,
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        assigneeId: dto.assigneeId,
        reporterId: dto.reporterId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        estimatedHours: dto.estimatedHours,
        tags: dto.tags,
        order: dto.order,
      },
      include: this.taskInclude(),
    });

    await this.logActivity(
      projectId,
      userId,
      'TASK_UPDATED',
      `Task "${task.title}" updated`,
    );

    return task;
  }

  async updateTaskStatus(
    projectId: string,
    id: string,
    dto: UpdateTaskStatusDto,
    userId?: string,
  ) {
    await this.ensureTaskExists(projectId, id);

    const task = await this.prisma.task.update({
      where: { id },
      data: { status: dto.status, order: dto.order },
      include: this.taskInclude(),
    });

    await this.logActivity(
      projectId,
      userId,
      'TASK_STATUS_CHANGED',
      `Task "${task.title}" moved to ${dto.status}`,
    );

    return task;
  }

  async removeTask(
    projectId: string,
    id: string,
  ): Promise<{ message: string }> {
    await this.ensureTaskExists(projectId, id);

    await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Task deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Task comments
  // ---------------------------------------------------------------------

  async addComment(
    projectId: string,
    taskId: string,
    dto: CreateCommentDto,
    authorId: string,
  ) {
    await this.ensureTaskExists(projectId, taskId);

    return this.prisma.taskComment.create({
      data: { taskId, authorId, content: dto.content },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });
  }

  async listComments(projectId: string, taskId: string) {
    await this.ensureTaskExists(projectId, taskId);

    return this.prisma.taskComment.findMany({
      where: { taskId },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async removeComment(
    projectId: string,
    taskId: string,
    commentId: string,
  ): Promise<{ message: string }> {
    await this.ensureTaskExists(projectId, taskId);

    const comment = await this.prisma.taskComment.findFirst({
      where: { id: commentId, taskId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.prisma.taskComment.delete({ where: { id: commentId } });

    return { message: 'Comment deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Bugs
  // ---------------------------------------------------------------------

  async createBug(projectId: string, dto: CreateBugDto, reportedById?: string) {
    await this.ensureProjectExists(projectId);

    return this.prisma.bug.create({
      data: {
        projectId,
        taskId: dto.taskId,
        title: dto.title,
        description: dto.description,
        severity: dto.severity,
        status: dto.status,
        reportedById,
        assigneeId: dto.assigneeId,
        stepsToReproduce: dto.stepsToReproduce,
        environment: dto.environment,
      },
      include: this.bugInclude(),
    });
  }

  async listBugs(projectId: string) {
    await this.ensureProjectExists(projectId);

    return this.prisma.bug.findMany({
      where: { projectId },
      include: this.bugInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBug(projectId: string, id: string) {
    return this.ensureBugExists(projectId, id, this.bugInclude());
  }

  async updateBug(projectId: string, id: string, dto: UpdateBugDto) {
    await this.ensureBugExists(projectId, id);

    return this.prisma.bug.update({
      where: { id },
      data: {
        taskId: dto.taskId,
        title: dto.title,
        description: dto.description,
        severity: dto.severity,
        status: dto.status,
        assigneeId: dto.assigneeId,
        stepsToReproduce: dto.stepsToReproduce,
        environment: dto.environment,
      },
      include: this.bugInclude(),
    });
  }

  async removeBug(projectId: string, id: string): Promise<{ message: string }> {
    await this.ensureBugExists(projectId, id);
    await this.prisma.bug.delete({ where: { id } });

    return { message: 'Bug deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Time entries
  // ---------------------------------------------------------------------

  async createTimeEntry(
    projectId: string,
    dto: CreateTimeEntryDto,
    userId: string,
  ) {
    await this.ensureProjectExists(projectId);

    const startTime = new Date(dto.startTime);
    const endTime = dto.endTime ? new Date(dto.endTime) : undefined;

    return this.prisma.timeEntry.create({
      data: {
        projectId,
        taskId: dto.taskId,
        userId,
        description: dto.description,
        startTime,
        endTime,
        durationMinutes: endTime
          ? Math.round((endTime.getTime() - startTime.getTime()) / 60000)
          : undefined,
        isBillable: dto.isBillable,
      },
    });
  }

  async listTimeEntries(projectId: string, userId?: string) {
    await this.ensureProjectExists(projectId);

    return this.prisma.timeEntry.findMany({
      where: { projectId, ...(userId ? { userId } : {}) },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        task: { select: { id: true, title: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async updateTimeEntry(
    projectId: string,
    id: string,
    dto: UpdateTimeEntryDto,
  ) {
    const existing = await this.ensureTimeEntryExists(projectId, id);

    const startTime = dto.startTime
      ? new Date(dto.startTime)
      : existing.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : existing.endTime;

    return this.prisma.timeEntry.update({
      where: { id },
      data: {
        taskId: dto.taskId,
        description: dto.description,
        startTime: dto.startTime ? startTime : undefined,
        endTime,
        durationMinutes: endTime
          ? Math.round((endTime.getTime() - startTime.getTime()) / 60000)
          : undefined,
        isBillable: dto.isBillable,
      },
    });
  }

  async removeTimeEntry(
    projectId: string,
    id: string,
  ): Promise<{ message: string }> {
    await this.ensureTimeEntryExists(projectId, id);
    await this.prisma.timeEntry.delete({ where: { id } });

    return { message: 'Time entry deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Activity log
  // ---------------------------------------------------------------------

  async listActivity(projectId: string, pagination: PaginationDto) {
    await this.ensureProjectExists(projectId);

    const where: Prisma.ActivityLogWhereInput = { projectId };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  private async logActivity(
    projectId: string,
    userId: string | undefined,
    action: string,
    description: string,
  ): Promise<void> {
    await this.prisma.activityLog.create({
      data: { projectId, userId, action, description },
    });
  }

  // ---------------------------------------------------------------------
  // Documents
  // ---------------------------------------------------------------------

  async addDocument(
    projectId: string,
    dto: CreateDocumentDto,
    uploadedById?: string,
  ) {
    await this.ensureProjectExists(projectId);

    return this.prisma.projectDocument.create({
      data: {
        projectId,
        uploadedById,
        name: dto.name,
        fileUrl: dto.fileUrl,
        fileType: dto.fileType,
        fileSize: dto.fileSize,
      },
    });
  }

  async listDocuments(projectId: string) {
    await this.ensureProjectExists(projectId);

    return this.prisma.projectDocument.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async removeDocument(
    projectId: string,
    id: string,
  ): Promise<{ message: string }> {
    const document = await this.prisma.projectDocument.findFirst({
      where: { id, projectId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.prisma.projectDocument.delete({ where: { id } });

    return { message: 'Document deleted successfully' };
  }

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------

  private taskInclude() {
    return {
      assignee: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      reporter: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      sprint: { select: { id: true, name: true } },
      _count: { select: { comments: true, bugs: true, timeEntries: true } },
    } satisfies Prisma.TaskInclude;
  }

  private bugInclude() {
    return {
      assignee: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      reportedBy: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      task: { select: { id: true, title: true } },
    } satisfies Prisma.BugInclude;
  }

  private async ensureProjectExists(id: string): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }

  private async ensureMilestoneExists(projectId: string, id: string) {
    const milestone = await this.prisma.milestone.findFirst({
      where: { id, projectId },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    return milestone;
  }

  private async ensureSprintExists(projectId: string, id: string) {
    const sprint = await this.prisma.sprint.findFirst({
      where: { id, projectId },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    return sprint;
  }

  private async ensureTaskExists(
    projectId: string,
    id: string,
    include?: Prisma.TaskInclude,
  ) {
    const task = await this.prisma.task.findFirst({
      where: { id, projectId, deletedAt: null },
      include,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  private async ensureBugExists(
    projectId: string,
    id: string,
    include?: Prisma.BugInclude,
  ) {
    const bug = await this.prisma.bug.findFirst({
      where: { id, projectId },
      include,
    });

    if (!bug) {
      throw new NotFoundException('Bug not found');
    }

    return bug;
  }

  private async ensureTimeEntryExists(projectId: string, id: string) {
    const entry = await this.prisma.timeEntry.findFirst({
      where: { id, projectId },
    });

    if (!entry) {
      throw new NotFoundException('Time entry not found');
    }

    return entry;
  }

  private async generateUniqueSlug(source: string): Promise<string> {
    const base = slugify(source);
    const existing = await this.prisma.project.findUnique({
      where: { slug: base },
    });

    return existing ? slugify(source, true) : base;
  }
}
