import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderChannel,
  OrderSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  ProductStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../common/dto/paginated-result.dto';
import { computeVoucherDiscount } from '../common/utils/voucher-discount.util';
import { InventoryService } from '../inventory/inventory.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CustomersService } from '../customers/customers.service';
import { STORAGE_SERVICE } from '../storage/storage.service.interface';
import type { StorageService } from '../storage/storage.service.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

const ORDER_DETAIL_INCLUDE = {
  customer: { select: { id: true, name: true, phone: true } },
  voucher: { select: { id: true, code: true } },
  createdBy: { select: { id: true, name: true } },
  items: true,
  images: { orderBy: { displayOrder: 'asc' } },
  statusHistory: {
    include: { changedBy: { select: { id: true, name: true } } },
    orderBy: { changedAt: 'asc' },
  },
} satisfies Prisma.OrderInclude;

const ORDER_LIST_INCLUDE = {
  customer: { select: { id: true, name: true, phone: true } },
} satisfies Prisma.OrderInclude;

type OrderDetail = Prisma.OrderGetPayload<{
  include: typeof ORDER_DETAIL_INCLUDE;
}>;
type OrderListItem = Prisma.OrderGetPayload<{
  include: typeof ORDER_LIST_INCLUDE;
}>;

interface ResolvedOrderItem {
  productId?: string;
  comboId?: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  costPrice?: number; // snapshot of unit cost — undefined if not set on the product(s) at order time
  subtotal: number;
}

interface FlashSaleIncrement {
  flashSaleItemId: string;
  quantity: number;
}

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.NEW]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.ARRANGING, OrderStatus.CANCELLED],
  [OrderStatus.ARRANGING]: [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPING]: [
    OrderStatus.COMPLETED,
    OrderStatus.DELIVERY_FAILED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.COMPLETED]: [],
  // Not a dead end: a failed delivery can be retried (back to SHIPPING,
  // no re-deduction needed — the arranged flowers were never restocked,
  // see the CANCELLED restock check below) or written off (CANCELLED,
  // which restocks normally since stockDeductedAt is still set).
  [OrderStatus.DELIVERY_FAILED]: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
  [OrderStatus.CANCELLED]: [],
};

const OPS_ROLES = [UserRole.ADMIN, UserRole.OPERATIONS_ADMIN];
const ALL_STAFF_ROLES = [
  UserRole.ADMIN,
  UserRole.OPERATIONS_ADMIN,
  UserRole.STAFF,
];

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
    private readonly notificationsService: NotificationsService,
    private readonly customersService: CustomersService,
    @Inject(STORAGE_SERVICE) private readonly storageService: StorageService,
  ) {}

  async create(
    dto: CreateOrderDto,
    actorUserId?: string,
    actorRole?: UserRole,
  ): Promise<OrderDetail> {
    if (!dto.customerId && !(dto.guestName && dto.guestPhone)) {
      throw new BadRequestException(
        'Cần chọn khách hàng có sẵn (customerId) hoặc nhập tên và SĐT khách vãng lai (guestName/guestPhone)',
      );
    }

    let customerId = dto.customerId;
    if (customerId) {
      const exists = await this.prisma.customer.findUnique({
        where: { id: customerId },
        select: { id: true },
      });
      if (!exists) {
        throw new NotFoundException('Không tìm thấy khách hàng');
      }
    } else if (actorUserId && dto.guestPhone) {
      // Admin-created orders only (actorUserId is never set on the public
      // storefront checkout path) — reuse or create a lightweight Customer
      // record by phone so repeat Zalo/phone customers accumulate order
      // history over time, matching "khách cũ tự điền, khách mới tự lưu".
      const existing = await this.customersService.findByPhone(dto.guestPhone);
      if (existing) {
        customerId = existing.id;
      } else if (dto.guestName) {
        const createdCustomer = await this.prisma.customer.create({
          data: { name: dto.guestName, phone: dto.guestPhone },
        });
        customerId = createdCustomer.id;
      }
    }

    const { items, subtotal, flashSaleIncrements } =
      await this.resolveOrderItems(dto.items, !!actorUserId, actorRole);
    const { voucherId, discountAmount } = await this.resolveVoucher(
      dto.voucherCode,
      subtotal,
    );
    const shippingFee = dto.shippingFee ?? 0;
    const total = Math.max(0, subtotal + shippingFee - discountAmount);
    const orderNumber = await this.generateOrderNumber();

    const created = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          guestName: dto.guestName,
          guestPhone: dto.guestPhone,
          recipientName: dto.recipientName,
          recipientPhone: dto.recipientPhone,
          deliveryAddress: dto.deliveryAddress,
          deliveryDistrict: dto.deliveryDistrict,
          deliveryDate: new Date(dto.deliveryDate),
          deliveryTime: dto.deliveryTime,
          cardMessage: dto.cardMessage,
          note: dto.note,
          paymentMethod: dto.paymentMethod ?? PaymentMethod.COD,
          subtotal,
          shippingFee,
          discountAmount,
          depositAmount: dto.depositAmount ?? 0,
          total,
          voucherId,
          source: dto.source ?? OrderSource.DIRECT,
          channel: dto.channel ?? OrderChannel.WEB,
          createdById: actorUserId,
          items: { create: items },
          statusHistory: {
            create: [
              {
                toStatus: OrderStatus.NEW,
                changedById: actorUserId,
                note: actorUserId
                  ? 'Tạo đơn hàng'
                  : 'Khách đặt hàng qua website',
              },
            ],
          },
        },
      });

      if (voucherId) {
        await tx.voucher.update({
          where: { id: voucherId },
          data: { usedCount: { increment: 1 } },
        });
      }

      for (const increment of flashSaleIncrements) {
        await tx.flashSaleItem.update({
          where: { id: increment.flashSaleItemId },
          data: { soldQuantity: { increment: increment.quantity } },
        });
      }

      return order;
    });

    await this.notificationsService.create(
      'NEW_ORDER',
      'Đơn hàng mới',
      `Đơn hàng ${created.orderNumber} vừa được tạo, tổng tiền ${total.toLocaleString('vi-VN')}đ`,
      created.id,
      UserRole.OPERATIONS_ADMIN,
    );

    return this.findOne(created.id);
  }

  async findAll(query: QueryOrderDto): Promise<PaginatedResult<OrderListItem>> {
    // `overdue` takes precedence over deliveryDateFrom/To and status when
    // combined — they're meant as alternative quick filters, not composed
    // together, from the admin list's tab UI.
    const deliveryDateFilter = query.overdue
      ? { deliveryDate: { lt: new Date() } }
      : query.deliveryDateFrom || query.deliveryDateTo
        ? {
            deliveryDate: {
              ...(query.deliveryDateFrom && {
                gte: new Date(query.deliveryDateFrom),
              }),
              ...(query.deliveryDateTo && {
                lte: new Date(query.deliveryDateTo),
              }),
            },
          }
        : {};

    const where: Prisma.OrderWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.paymentStatus && { paymentStatus: query.paymentStatus }),
      ...(query.channel && { channel: query.channel }),
      ...(query.customerId && { customerId: query.customerId }),
      ...(query.voucherId && { voucherId: query.voucherId }),
      ...(query.search && {
        OR: [
          { orderNumber: { contains: query.search, mode: 'insensitive' } },
          { recipientName: { contains: query.search, mode: 'insensitive' } },
          { recipientPhone: { contains: query.search } },
        ],
      }),
      ...deliveryDateFilter,
      ...(query.overdue && {
        status: {
          notIn: [
            OrderStatus.COMPLETED,
            OrderStatus.CANCELLED,
            OrderStatus.DELIVERY_FAILED,
          ],
        },
      }),
      ...(query.unpaidOnly && { paymentStatus: { not: PaymentStatus.PAID } }),
      ...(query.missingCostPrice && { items: { some: { costPrice: null } } }),
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
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: ORDER_DETAIL_INCLUDE,
    });
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    return order;
  }

  async update(id: string, dto: UpdateOrderDto): Promise<OrderDetail> {
    const order = await this.findOne(id);

    if (
      order.status !== OrderStatus.NEW &&
      order.status !== OrderStatus.CONFIRMED
    ) {
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

  /** Manual payment-status control (Đã cọc/Đã thanh toán đủ) — separate from
   * changeStatus() since payment status is independent of order status. */
  async updatePayment(id: string, dto: UpdatePaymentDto): Promise<OrderDetail> {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: {
        paymentStatus: dto.paymentStatus,
        ...(dto.depositAmount !== undefined && {
          depositAmount: dto.depositAmount,
        }),
      },
      include: ORDER_DETAIL_INCLUDE,
    });
  }

  /** Backfill a missing costPrice on one order item — editable regardless of
   * order status (unlike update()'s logistics fields) since this is purely a
   * bookkeeping correction for Reports' gross-profit figures, including on
   * already-COMPLETED orders. */
  async updateItemCostPrice(
    orderId: string,
    itemId: string,
    costPrice: number,
  ): Promise<OrderDetail> {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
    });
    if (!item || item.orderId !== orderId) {
      throw new NotFoundException('Không tìm thấy mục trong đơn hàng');
    }
    await this.prisma.orderItem.update({
      where: { id: itemId },
      data: { costPrice },
    });
    return this.findOne(orderId);
  }

  /** Sửa phí ship thực tế (VD: chỉ biết giá sau khi book Grab lúc giao) —
   * độc lập với mọi bước chuyển trạng thái, luôn tính lại và lưu total
   * cùng lúc để hóa đơn/còn phải thu không bao giờ lệch với shippingFee.
   * Khoá lại khi đơn đã COMPLETED (đã cộng vào Customer.totalSpent, sửa
   * sau đó sẽ làm lệch số tổng chi tiêu của khách mà không tự điều chỉnh
   * lại) hoặc đã CANCELLED (không còn ý nghĩa). */
  async updateShippingFee(
    orderId: string,
    shippingFee: number,
  ): Promise<OrderDetail> {
    const order = await this.findOne(orderId);

    if (
      order.status === OrderStatus.COMPLETED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new ConflictException(
        'Không thể sửa phí ship khi đơn đã hoàn thành hoặc đã huỷ',
      );
    }

    const total = Math.max(
      0,
      order.subtotal + shippingFee - order.discountAmount,
    );

    return this.prisma.order.update({
      where: { id: orderId },
      data: { shippingFee, total },
      include: ORDER_DETAIL_INCLUDE,
    });
  }

  /** Reference images (ảnh mẫu khách gửi qua Zalo/Facebook) — same
   * upload/delete shape as ProductsService.addImage/removeImage. */
  async addImage(
    orderId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
    altText?: string,
  ) {
    await this.findOne(orderId);

    const uploaded = await this.storageService.upload({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      folder: 'orders',
    });

    const currentCount = await this.prisma.orderImage.count({
      where: { orderId },
    });

    return this.prisma.orderImage.create({
      data: {
        orderId,
        url: uploaded.url,
        storageKey: uploaded.key,
        altText,
        displayOrder: currentCount,
      },
    });
  }

  async removeImage(orderId: string, imageId: string): Promise<void> {
    const image = await this.prisma.orderImage.findUnique({
      where: { id: imageId },
    });
    if (!image || image.orderId !== orderId) {
      throw new NotFoundException('Không tìm thấy ảnh đơn hàng');
    }
    await this.prisma.orderImage.delete({ where: { id: imageId } });
    if (image.storageKey) {
      await this.storageService.delete(image.storageKey).catch(() => undefined);
    }
  }

  async changeStatus(
    id: string,
    dto: ChangeOrderStatusDto,
    actorUserId: string,
    actorRole: UserRole,
  ): Promise<OrderDetail> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    const allowedNext = ALLOWED_TRANSITIONS[order.status];
    if (!allowedNext.includes(dto.toStatus)) {
      throw new BadRequestException(
        `Không thể chuyển đơn hàng từ trạng thái ${order.status} sang ${dto.toStatus}`,
      );
    }

    const allowedRoles = this.getAllowedRolesForTransition(
      order.status,
      dto.toStatus,
    );
    if (!allowedRoles.includes(actorRole)) {
      throw new ForbiddenException(
        `Vai trò hiện tại không được phép chuyển đơn hàng sang trạng thái ${dto.toStatus}`,
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

    // Không nhắc tới tiền trong nội dung — STAFF sẽ đọc trực tiếp thông báo
    // "Đã xác nhận" và không được thấy bất kỳ số tiền nào trên đơn hàng.
    if (dto.toStatus === OrderStatus.CONFIRMED) {
      await this.notificationsService.create(
        'NEW_ORDER',
        'Đơn hàng cần cắm hoa',
        `Đơn hàng ${order.orderNumber} đã xác nhận, sẵn sàng cắm hoa`,
        order.id,
        UserRole.STAFF,
      );
    }
    if (dto.toStatus === OrderStatus.READY) {
      await this.notificationsService.create(
        'NEW_ORDER',
        'Đơn hàng chờ giao',
        `Đơn hàng ${order.orderNumber} đã cắm hoa xong, chờ giao — cần book Grab và cập nhật phí ship`,
        order.id,
        UserRole.OPERATIONS_ADMIN,
      );
    }

    return this.findOne(id);
  }

  /** Vai trò được phép thực hiện 1 bước chuyển trạng thái cụ thể — bảng
   * quyết định đã chốt: STAFF chỉ vận hành nội bộ (cắm hoa), không đụng tới
   * khâu duyệt đơn/giao hàng/huỷ đơn; huỷ đơn (từ bất kỳ trạng thái nào)
   * luôn là ADMIN/OPERATIONS_ADMIN. */
  private getAllowedRolesForTransition(
    from: OrderStatus,
    to: OrderStatus,
  ): UserRole[] {
    if (to === OrderStatus.CANCELLED) {
      return OPS_ROLES;
    }
    if (
      (from === OrderStatus.CONFIRMED && to === OrderStatus.ARRANGING) ||
      (from === OrderStatus.ARRANGING && to === OrderStatus.READY)
    ) {
      return ALL_STAFF_ROLES;
    }
    // Mới→Đã xác nhận, Chờ giao→Đang giao, Đang giao→Đã giao/Giao thất bại,
    // Giao thất bại→Đang giao (giao lại): chỉ vận hành, không phải STAFF.
    return OPS_ROLES;
  }

  private async resolveOrderItems(
    items: CreateOrderItemDto[],
    allowCustomItems: boolean,
    actorRole?: UserRole,
  ): Promise<{
    items: ResolvedOrderItem[];
    subtotal: number;
    flashSaleIncrements: FlashSaleIncrement[];
  }> {
    let subtotal = 0;
    const resolved: ResolvedOrderItem[] = [];
    const flashSaleIncrements: FlashSaleIncrement[] = [];

    for (const item of items) {
      const choiceCount = [
        item.productId,
        item.comboId,
        item.customName,
      ].filter(Boolean).length;
      if (choiceCount > 1) {
        throw new BadRequestException(
          'Mỗi mục chỉ được chọn 1 trong: sản phẩm, combo, hoặc mẫu tuỳ chỉnh',
        );
      }
      if (choiceCount === 0) {
        throw new BadRequestException(
          'Mỗi mục phải có productId, comboId, hoặc mẫu tuỳ chỉnh (customName)',
        );
      }

      if (item.customName) {
        // Gated to admin-created orders only (allowCustomItems is derived
        // from actorUserId presence in create()) — the public storefront
        // checkout shares this exact DTO/method, so without this check a
        // request could set an arbitrary customPrice on a live order.
        if (!allowCustomItems) {
          throw new BadRequestException(
            'Mẫu tuỳ chỉnh chỉ được dùng khi admin tạo đơn thủ công',
          );
        }
        if (item.customPrice === undefined) {
          throw new BadRequestException(
            'Mẫu tuỳ chỉnh cần có giá (customPrice)',
          );
        }
        // Chỉ ADMIN được tự nhập giá gốc — nếu không chặn, OPERATIONS_ADMIN
        // có thể tự set customCostPrice khi thêm mẫu tuỳ chỉnh, vô hiệu hoá
        // hoàn toàn việc ẩn giá gốc với role này. Từ chối rõ ràng (400),
        // không âm thầm bỏ qua giá trị gửi lên.
        if (
          item.customCostPrice !== undefined &&
          actorRole !== UserRole.ADMIN
        ) {
          throw new BadRequestException(
            'Chỉ Quản trị viên được nhập giá gốc (customCostPrice) cho mẫu tuỳ chỉnh',
          );
        }
        resolved.push({
          itemName: item.customName,
          quantity: item.quantity,
          unitPrice: item.customPrice,
          costPrice: item.customCostPrice,
          subtotal: item.customPrice * item.quantity,
        });
        subtotal += item.customPrice * item.quantity;
        continue;
      }

      if (item.productId) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(
            `Không tìm thấy sản phẩm ${item.productId}`,
          );
        }
        if (product.status === ProductStatus.ARCHIVED) {
          throw new BadRequestException(
            `Sản phẩm "${product.name}" đã ngừng kinh doanh`,
          );
        }

        const flashSaleItem = await this.findActiveFlashSaleItem(
          product.id,
          item.quantity,
        );
        const unitPrice =
          flashSaleItem?.salePrice ?? product.salePrice ?? product.basePrice;
        if (flashSaleItem) {
          flashSaleIncrements.push({
            flashSaleItemId: flashSaleItem.id,
            quantity: item.quantity,
          });
        }

        resolved.push({
          productId: product.id,
          itemName: product.name,
          quantity: item.quantity,
          unitPrice,
          costPrice: product.costPrice ?? undefined,
          subtotal: unitPrice * item.quantity,
        });
        subtotal += unitPrice * item.quantity;
      } else {
        const combo = await this.prisma.combo.findUnique({
          where: { id: item.comboId },
          include: {
            items: { include: { product: { select: { costPrice: true } } } },
          },
        });
        if (!combo) {
          throw new NotFoundException(`Không tìm thấy combo ${item.comboId}`);
        }
        if (!combo.isActive) {
          throw new BadRequestException(
            `Combo "${combo.name}" đã ngừng kinh doanh`,
          );
        }
        // Cost of assembling one combo unit = sum of its constituent products'
        // cost prices — only meaningful if every constituent has one set,
        // otherwise leave it undefined rather than silently underestimating.
        const comboCostPrice = combo.items.every(
          (ci) => ci.product.costPrice != null,
        )
          ? combo.items.reduce(
              (sum, ci) => sum + ci.quantity * (ci.product.costPrice ?? 0),
              0,
            )
          : undefined;
        resolved.push({
          comboId: combo.id,
          itemName: combo.name,
          quantity: item.quantity,
          unitPrice: combo.price,
          costPrice: comboCostPrice,
          subtotal: combo.price * item.quantity,
        });
        subtotal += combo.price * item.quantity;
      }
    }

    return { items: resolved, subtotal, flashSaleIncrements };
  }

  /**
   * Returns the active flash-sale price for a product, if one exists and still has
   * capacity for the requested quantity. Picks the sale ending soonest when more than
   * one is active for the same product. Sold-out sales (soldQuantity would exceed
   * quantityLimit) silently fall back to the product's normal price.
   */
  private async findActiveFlashSaleItem(
    productId: string,
    requestedQuantity: number,
  ): Promise<{ id: string; salePrice: number } | null> {
    const now = new Date();
    const candidates = await this.prisma.flashSaleItem.findMany({
      where: {
        productId,
        flashSale: {
          isActive: true,
          startAt: { lte: now },
          endAt: { gte: now },
        },
      },
      orderBy: { flashSale: { endAt: 'asc' } },
    });

    const withCapacity = candidates.find(
      (item) =>
        item.quantityLimit === null ||
        item.soldQuantity + requestedQuantity <= item.quantityLimit,
    );

    return withCapacity
      ? { id: withCapacity.id, salePrice: withCapacity.salePrice }
      : null;
  }

  private async resolveVoucher(
    code: string | undefined,
    subtotal: number,
  ): Promise<{ voucherId?: string; discountAmount: number }> {
    if (!code) {
      return { discountAmount: 0 };
    }

    // Must match VouchersService.validate()'s normalization exactly — codes are
    // stored uppercase (see VouchersService.create/update), and the storefront's
    // voucher-preview endpoint already uppercases before lookup. Skipping this
    // here let a case mismatch pass preview but fail at real order creation.
    const voucher = await this.prisma.voucher.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
    if (!voucher) {
      throw new BadRequestException('Voucher không hợp lệ');
    }

    const discountAmount = computeVoucherDiscount(voucher, subtotal);

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
