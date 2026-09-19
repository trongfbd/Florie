import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { QueryOrderDto } from '../orders/dto/query-order.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaymentsService } from '../payments/payments.service';
import type { AuthenticatedCustomer } from '../customer-auth/types/customer-jwt-payload.type';
import { CreateStorefrontOrderDto } from './dto/create-storefront-order.dto';
import { TrackOrderDto } from './dto/track-order.dto';

// No shipping-zone logic yet — flat rate for the whole service area.
const FLAT_SHIPPING_FEE_VND = 30_000;

const TRACKED_ORDER_SELECT = {
  orderNumber: true,
  status: true,
  recipientName: true,
  deliveryAddress: true,
  deliveryDate: true,
  deliveryTime: true,
  total: true,
  paymentMethod: true,
  paymentStatus: true,
  createdAt: true,
  statusHistory: {
    select: { toStatus: true, note: true, changedAt: true },
    orderBy: { changedAt: 'asc' as const },
  },
};

@Injectable()
export class StorefrontOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async create(dto: CreateStorefrontOrderDto, customer?: AuthenticatedCustomer, ipAddr?: string) {
    // Checked BEFORE creating the order — an unconfigured gateway must never
    // leave an orphaned order behind with no way to pay it.
    if (dto.paymentMethod) {
      this.paymentsService.assertAvailable(dto.paymentMethod);
    }

    const order = await this.ordersService.create({
      ...dto,
      customerId: customer?.id,
      shippingFee: FLAT_SHIPPING_FEE_VND,
    });

    if (!this.paymentsService.isOnlineMethod(order.paymentMethod)) {
      return order;
    }

    // Order is created up front either way (stock isn't touched until an
    // admin later moves it to ARRANGING — see Order.stockDeductedAt), so an
    // abandoned/failed online payment just leaves an UNPAID order behind
    // rather than needing a separate "payment intent" step before this one.
    const paymentUrl = await this.paymentsService.createPaymentUrl(order.paymentMethod, {
      orderNumber: order.orderNumber,
      amount: order.total,
      orderInfo: `Thanh toan don hang ${order.orderNumber}`,
      ipAddr: ipAddr ?? '127.0.0.1',
    });

    return { ...order, paymentUrl };
  }

  async track(dto: TrackOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber: dto.orderNumber },
      select: {
        ...TRACKED_ORDER_SELECT,
        recipientPhone: true,
        guestPhone: true,
        customer: { select: { phone: true } },
      },
    });

    const phoneMatches =
      order &&
      (order.recipientPhone === dto.phone ||
        order.guestPhone === dto.phone ||
        order.customer?.phone === dto.phone);

    if (!phoneMatches) {
      throw new NotFoundException('Không tìm thấy đơn hàng khớp với mã đơn và số điện thoại đã nhập');
    }

    const { recipientPhone: _recipientPhone, guestPhone: _guestPhone, customer: _customer, ...publicFields } = order;
    return publicFields;
  }

  myOrders(customerId: string, query: PaginationQueryDto) {
    const orderQuery = plainToInstance(QueryOrderDto, {
      page: query.page,
      limit: query.limit,
      customerId,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    return this.ordersService.findAll(orderQuery);
  }
}
