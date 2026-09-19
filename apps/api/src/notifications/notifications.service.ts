import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification, NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../common/dto/paginated-result.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
  ) {}

  /** Internal helper for other services (orders, customer-auth, inventory) to raise a notification. */
  async create(
    type: NotificationType,
    title: string,
    message: string,
    relatedEntityId?: string,
  ): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: { type, title, message, relatedEntityId },
    });
    this.gateway.emitNew(notification);
    return notification;
  }

  async findAll(
    query: QueryNotificationDto,
  ): Promise<PaginatedResult<Notification>> {
    const where: Prisma.NotificationWhereInput = {
      ...(query.unreadOnly && { isRead: false }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return buildPaginatedResult(data, total, query.page, query.limit);
  }

  unreadCount(): Promise<number> {
    return this.prisma.notification.count({ where: { isRead: false } });
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  }
}
