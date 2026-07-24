import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification, Prisma } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { createPaginatedResult } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
  ) {}

  async findAll(
    userId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Notification>> {
    const where: Prisma.NotificationWhereInput = { userId };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: pagination.sortOrder },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return createPaginatedResult(data, total, pagination);
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { count };
  }

  async markRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string): Promise<{ message: string }> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read' };
  }

  /**
   * Helper used by other feature modules to raise a notification for a
   * user; persists the row and pushes a realtime event over the `/ws`
   * gateway in the same call.
   */
  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        type: dto.type,
        link: dto.link,
      },
    });

    this.gateway.emitToUser(dto.userId, 'notification', notification);

    return notification;
  }
}
