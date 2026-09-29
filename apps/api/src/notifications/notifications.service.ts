import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Notification,
  NotificationType,
  Prisma,
  UserRole,
} from '@prisma/client';
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

  /** Internal helper for other services (orders, customer-auth, inventory) to
   * raise a notification. targetRole omitted = chung, mọi role thấy (VD
   * khách mới); có targetRole thì chỉ role đó + ADMIN thấy/nhận real-time. */
  async create(
    type: NotificationType,
    title: string,
    message: string,
    relatedEntityId?: string,
    targetRole?: UserRole,
  ): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: { type, title, message, relatedEntityId, targetRole },
    });
    if (targetRole) {
      this.gateway.emitToRole(targetRole, notification);
    } else {
      this.gateway.emitNew(notification);
    }
    return notification;
  }

  async findAll(
    query: QueryNotificationDto,
    role: UserRole,
  ): Promise<PaginatedResult<Notification>> {
    const where: Prisma.NotificationWhereInput = {
      ...this.visibleToRole(role),
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

  unreadCount(role: UserRole): Promise<number> {
    return this.prisma.notification.count({
      where: { ...this.visibleToRole(role), isRead: false },
    });
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

  /** Scoped to the caller's own visibility — nếu không lọc theo role, 1
   * OPERATIONS_ADMIN bấm "đánh dấu tất cả đã đọc" sẽ âm thầm đánh dấu luôn
   * cả thông báo dành riêng cho STAFF mà họ chưa từng thấy. */
  async markAllAsRead(role: UserRole): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { ...this.visibleToRole(role), isRead: false },
      data: { isRead: true },
    });
  }

  private visibleToRole(role: UserRole): Prisma.NotificationWhereInput {
    if (role === UserRole.ADMIN) {
      return {};
    }
    return { OR: [{ targetRole: null }, { targetRole: role }] };
  }
}
