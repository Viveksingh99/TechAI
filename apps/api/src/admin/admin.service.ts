import { randomBytes } from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { createPaginatedResult } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------

  async dashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalProjects,
      activeProjects,
      totalTasks,
      openTickets,
      totalEmployees,
      totalLeads,
      openDeals,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.project.count({ where: { deletedAt: null } }),
      this.prisma.project.count({
        where: { deletedAt: null, status: { in: ['PLANNING', 'IN_PROGRESS'] } },
      }),
      this.prisma.task.count({ where: { deletedAt: null } }),
      this.prisma.ticket.count({
        where: { deletedAt: null, status: { in: ['OPEN', 'IN_PROGRESS', 'REOPENED'] } },
      }),
      this.prisma.employee.count({ where: { deletedAt: null } }),
      this.prisma.lead.count({ where: { deletedAt: null } }),
      this.prisma.deal.count({ where: { deletedAt: null, status: 'OPEN' } }),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers },
      projects: { total: totalProjects, active: activeProjects },
      tasks: { total: totalTasks },
      support: { openTickets },
      hr: { totalEmployees },
      crm: { totalLeads, openDeals },
    };
  }

  async usersOverview() {
    const byRole = await this.prisma.user.groupBy({
      by: ['roleId'],
      where: { deletedAt: null },
      _count: { _all: true },
    });

    const roles = await this.prisma.role.findMany();
    const roleMap = new Map(roles.map((role) => [role.id, role.name]));

    const recentUsers = await this.prisma.user.findMany({
      where: { deletedAt: null },
      include: { role: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      byRole: byRole.map((row) => ({
        role: roleMap.get(row.roleId) ?? 'UNKNOWN',
        count: row._count._all,
      })),
      recentUsers: recentUsers.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        isActive: user.isActive,
        createdAt: user.createdAt,
      })),
    };
  }

  // ---------------------------------------------------------------------
  // Audit logs
  // ---------------------------------------------------------------------

  async listAuditLogs(
    pagination: PaginationDto,
    filter: { userId?: string; entity?: string },
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.AuditLogWhereInput = {
      ...(filter.userId ? { userId: filter.userId } : {}),
      ...(filter.entity ? { entity: filter.entity } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  // ---------------------------------------------------------------------
  // System settings
  // ---------------------------------------------------------------------

  listSystemSettings() {
    return this.prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
  }

  async getSystemSetting(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({ where: { key } });

    if (!setting) {
      throw new NotFoundException('System setting not found');
    }

    return setting;
  }

  upsertSystemSetting(key: string, dto: UpdateSystemSettingDto) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      create: {
        key,
        value: dto.value as Prisma.InputJsonValue,
        description: dto.description,
      },
      update: { value: dto.value as Prisma.InputJsonValue, description: dto.description },
    });
  }

  // ---------------------------------------------------------------------
  // API keys
  // ---------------------------------------------------------------------

  async createApiKey(dto: CreateApiKeyDto, userId?: string) {
    const key = `tk_${randomBytes(24).toString('hex')}`;

    return this.prisma.apiKey.create({
      data: {
        name: dto.name,
        key,
        userId,
        scopes: dto.scopes ?? [],
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  listApiKeys() {
    return this.prisma.apiKey.findMany({
      select: {
        id: true,
        name: true,
        scopes: true,
        lastUsedAt: true,
        expiresAt: true,
        isActive: true,
        createdAt: true,
        key: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeApiKey(id: string): Promise<{ message: string }> {
    await this.ensureApiKeyExists(id);
    await this.prisma.apiKey.update({ where: { id }, data: { isActive: false } });

    return { message: 'API key revoked successfully' };
  }

  async removeApiKey(id: string): Promise<{ message: string }> {
    await this.ensureApiKeyExists(id);
    await this.prisma.apiKey.delete({ where: { id } });

    return { message: 'API key deleted successfully' };
  }

  private async ensureApiKeyExists(id: string): Promise<void> {
    const key = await this.prisma.apiKey.findUnique({ where: { id } });

    if (!key) {
      throw new NotFoundException('API key not found');
    }
  }
}
