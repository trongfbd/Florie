import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  DiscountType,
  OrderSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  ProductStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginatedResult, PaginatedResult } from '../common/dto/paginated-result.dto';
import { InventoryService } from '../inventory/inventory.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';

const ORDER_DETAIL_INCLUDE = {
  customer: { select: { id: true, name: true, phone: true } },
  voucher: { select: { id: true, code: true } },
  createdBy: { select: { id: true, name: true } },
  items: true,
  statusHistory: {
    include: { changedBy: { select: { id: true, name: true } } },
    orderBy: { changedAt: 'asc' },
  },
} satisfies Prisma.OrderInclude;

const ORDER_LIST_INCLUDE = {
  customer: { select: { id: true, name: true, phone: true } },
} satisfies Prisma.OrderInclude;

type OrderDetail = Prisma.OrderGetPayload<{ include: typeof ORDER_DETAIL_INCLUDE }>;
type OrderListItem = Prisma.OrderGetPayload<{ include: typeof ORDER_LIST_INCLUDE }>;

interface ResolvedOrderItem {
  productId?: string;
  comboId?: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.NEW]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.ARRANGING, OrderStatus.CANCELLED],
  [OrderStatus.ARRANGING]: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPING]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

  async create(dto: CreateOrderDto, actorUserId?: string): Promise<OrderDetail> {
    if (!dto.customerId && !(dto.guestName && dto.guestPhone)) {
      throw new BadRequestException(
        'Cần chọn khách hàng có sẵn (customerId) hoặc nhập tên và SĐT khách vãng lai (guestName/guestPhone)',
      );
    }

    if (dto.customerId) {
      const exists = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
        select: { id: true },
      });
      if (!exists) {
        throw new NotFoundException('Không tìm thấy khách hàng');
      }
    }

    const { items, subtotal } = await this.resolveOrderItems(dto.items);
    const { voucherId, discountAmount } = await this.resolveVoucher(dto.voucherCode, subtotal);
    const shippingFee = dto.shippingFee ?? 0;
    const total = Math.max(0, subtotal + shippingFee - discountAmount);
    const orderNumber = await this.generateOrderNumber();

    const created = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: dto.customerId,
          guestName: dto.guestName,
          guestPhone: dto.guestPhone,
          recipientName: dto.recipientName,
          recipientPhone: dto.recipientPhone,
          deliveryAddress: dto.deliveryAddress,
          deliveryDate: new Date(dto.deliveryDate),
          deliveryTime: dto.deliveryTime,
          cardMessage: dto.cardMessage,
          note: dto.note,
          paymentMethod: dto.paymentMethod ?? PaymentMethod.COD,
          subtotal,
          shippingFee,
          discountAmount,
          total,
          voucherId,
          source: dto.source ?? OrderSource.DIRECT,
          createdById: actorUserId,
          items: { create: items },
          statusHistory: {
            create: [
              {
                toStatus: OrderStatus.NEW,
                changedById: actorUserId,
                note: actorUserId ? 'Tạo đơn hàng' : 'Khách đặt hàng qua website',
              },
            ],
          },
        },
      });

      if (voucherId) {
        await tx.voucher.update({ where: { id: voucherId }, data: { usedCount: { increment: 1 } } });
      }

      return order;
    });

    return this.findOne(created.id);
  }

  async findAll(query: QueryOrderDto): Promise<PaginatedResult<OrderListItem>> {
    const where: Prisma.OrderWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.customerId && { customerId: query.customerId }),
      ...(query.search && {
        OR: [
          { orderNumber: { contains: query.search, mode: 'insensitive' } },
          { recipientName: { contains: query.search, mode: 'insensitive' } },
          { recipientPhone: { contains: query.search } },
        ],
      }),
      ...((query.deliveryDateFrom || query.deliveryDateTo) && {
        deliveryDate: {
          ...(query.deliveryDateFrom && { gte: new Date(query.deliveryDateFrom) }),
          ...(query.deliveryDateTo && { lte: new Date(query.deliveryDateTo) }),
        },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: ORDER_LIST_INCLUDE,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.order.count({ where }),
    ]);

    return buildPaginatedResult(data, total, query.page, query.limit);
  }

  async findOne(id: string): Promise<OrderDetail> {
    const order = await this.prisma.order.findUnique({ where: { id }, include: ORDER_DETAIL_INCLUDE });
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    return order;
  }

  async update(id: string, dto: UpdateOrderDto): Promise<OrderDetail> {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.NEW && order.status !== OrderStatus.CONFIRMED) {
      throw new ConflictException(
        'Chỉ có thể sửa thông tin đơn khi đang ở trạng thái Đơn mới hoặc Đã xác nhận',
      );
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.deliveryDate && { deliveryDate: new Date(dto.deliveryDate) }),
      },
      include: ORDER_DETAIL_INCLUDE,
    });
  }

  async changeStatus(id: string, dto: ChangeOrderStatusDto, actorUserId: string): Promise<OrderDetail> {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    const allowedNext = ALLOWED_TRANSITIONS[order.status];
    if (!allowedNext.includes(dto.toStatus)) {
      throw new BadRequestException(
        `Không thể chuyển đơn hàng từ trạng thái ${order.status} sang ${dto.toStatus}`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.OrderUpdateInput = { status: dto.toStatus };

      if (dto.toStatus === OrderStatus.ARRANGING) {
        await this.inventoryService.deductForOrder(order.items, tx);
        updateData.stockDeductedAt = new Date();
      }

      if (dto.toStatus === OrderStatus.CANCELLED && order.stockDeductedAt) {
        await this.inventoryService.restockForOrder(order.items, tx);
      }

      if (dto.toStatus === OrderStatus.COMPLETED) {
        updateData.paymentStatus = PaymentStatus.PAID;
        if (order.customerId) {
          await tx.customer.update({
            where: { id: order.customerId },
            data: { totalSpent: { increment: order.total } },
          });
        }
      }

      await tx.order.update({ where: { id }, data: updateData });
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: dto.toStatus,
          changedById: actorUserId,
          note: dto.note,
        },
      });
    });

    return this.findOne(id);
  }

  private async resolveOrderItems(
    items: CreateOrderItemDto[],
  ): Promise<{ items: ResolvedOrderItem[]; subtotal: number }> {
    let subtotal = 0;
    const resolved: ResolvedOrderItem[] = [];

    for (const item of items) {
      if (item.productId && item.comboId) {
        throw new BadRequestException('Mỗi mục chỉ được chọn 1 trong 2: sản phẩm hoặc combo');
      }
      if (!item.productId && !item.comboId) {
        throw new BadRequestException('Mỗi mục phải có productId hoặc comboId');
      }

      if (item.productId) {
        const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new NotFoundException(`Không tìm thấy sản phẩm ${item.productId}`);
        }
        if (product.status === ProductStatus.ARCHIVED) {
          throw new BadRequestException(`Sản phẩm "${product.name}" đã ngừng kinh doanh`);
        }
        const unitPrice = product.salePrice ?? product.basePrice;
        resolved.push({
          productId: product.id,
          itemName: product.name,
          quantity: item.quantity,
          unitPrice,
          subtotal: unitPrice * item.quantity,
        });
        subtotal += unitPrice * item.quantity;
      } else {
        const combo = await this.prisma.combo.findUnique({ where: { id: item.comboId } });
        if (!combo) {
          throw new NotFoundException(`Không tìm thấy combo ${item.comboId}`);
        }
        if (!combo.isActive) {
          throw new BadRequestException(`Combo "${combo.name}" đã ngừng kinh doanh`);
        }
        resolved.push({
          comboId: combo.id,
          itemName: combo.name,
          quantity: item.quantity,
          unitPrice: combo.price,
          subtotal: combo.price * item.quantity,
        });
        subtotal += combo.price * item.quantity;
      }
    }

    return { items: resolved, subtotal };
  }

  private async resolveVoucher(
    code: string | undefined,
    subtotal: number,
  ): Promise<{ voucherId?: string; discountAmount: number }> {
    if (!code) {
      return { discountAmount: 0 };
    }

    const voucher = await this.prisma.voucher.findUnique({ where: { code } });
    if (!voucher || !voucher.isActive) {
      throw new BadRequestException('Voucher không hợp lệ');
    }

    const now = new Date();
    if (now < voucher.startAt || now > voucher.endAt) {
      throw new BadRequestException('Voucher đã hết hạn hoặc chưa đến ngày áp dụng');
    }
    if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
      throw new BadRequestException('Voucher đã hết lượt sử dụng');
    }
    if (subtotal < voucher.minOrderValue) {
      throw new BadRequestException(
        `Đơn hàng cần tối thiểu ${voucher.minOrderValue}đ để áp dụng voucher này`,
      );
    }

    let discountAmount =
      voucher.discountType === DiscountType.PERCENTAGE
        ? Math.floor((subtotal * voucher.discountValue) / 100)
        : voucher.discountValue;

    if (voucher.maxDiscountAmount !== null) {
      discountAmount = Math.min(discountAmount, voucher.maxDiscountAmount);
    }
    discountAmount = Math.min(discountAmount, subtotal);

    return { voucherId: voucher.id, discountAmount };
  }

  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate(),
    ).padStart(2, '0')}`;
    const prefix = `FL${datePart}`;

    const countToday = await this.prisma.order.count({
      where: { orderNumber: { startsWith: prefix } },
    });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const seq = String(countToday + 1 + attempt).padStart(4, '0');
      const candidate = `${prefix}-${seq}`;
      const exists = await this.prisma.order.findUnique({
        where: { orderNumber: candidate },
        select: { id: true },
      });
      if (!exists) {
        return candidate;
      }
    }

    throw new ConflictException('Không thể sinh mã đơn hàng, vui lòng thử lại');
  }
}
