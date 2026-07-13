import { Injectable, NotFoundException } from '@nestjs/common';
import { Popup, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginatedResult, PaginatedResult } from '../common/dto/paginated-result.dto';
import { CreatePopupDto } from './dto/create-popup.dto';
import { UpdatePopupDto } from './dto/update-popup.dto';
import { QueryPopupDto } from './dto/query-popup.dto';

const POPUP_INCLUDE = {
  voucher: { select: { id: true, code: true, discountType: true, discountValue: true } },
} satisfies Prisma.PopupInclude;

type PopupWithVoucher = Prisma.PopupGetPayload<{ include: typeof POPUP_INCLUDE }>;

@Injectable()
export class PopupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePopupDto): Promise<PopupWithVoucher> {
    if (dto.voucherId) {
      await this.assertVoucherExists(dto.voucherId);
    }
    return this.prisma.popup.create({
      data: {
        ...dto,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
      },
      include: POPUP_INCLUDE,
    });
  }

  async findAll(query: QueryPopupDto): Promise<PaginatedResult<PopupWithVoucher>> {
    const where: Prisma.PopupWhereInput = {
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.popup.findMany({
        where,
        include: POPUP_INCLUDE,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.popup.count({ where }),
    ]);

    return buildPaginatedResult(data, total, query.page, query.limit);
  }

  async findOne(id: string): Promise<PopupWithVoucher> {
    const popup = await this.prisma.popup.findUnique({ where: { id }, include: POPUP_INCLUDE });
    if (!popup) {
      throw new NotFoundException('Không tìm thấy popup');
    }
    return popup;
  }

  /**
   * Public storefront: the currently-running popup that applies to this visitor, if any.
   * A popup only ever qualifies when it has a linked voucher that is itself currently active
   * and within its own date window — an "announcement-only" popup (no voucher) never shows,
   * per the requirement that popups always advertise a real, live voucher campaign.
   * Audience match is OR: new customer (0 orders, includes guests) OR returning customer with
   * orderCount >= returningCustomerMinOrders.
   */
  async findActiveForCustomer(customerId: string | null): Promise<PopupWithVoucher | null> {
    const now = new Date();

    const candidates = await this.prisma.popup.findMany({
      where: {
        isActive: true,
        voucherId: { not: null },
        AND: [
          { OR: [{ startAt: null }, { startAt: { lte: now } }] },
          { OR: [{ endAt: null }, { endAt: { gte: now } }] },
        ],
        voucher: {
          isActive: true,
          startAt: { lte: now },
          endAt: { gte: now },
        },
      },
      include: POPUP_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    if (candidates.length === 0) {
      return null;
    }

    const orderCount = customerId
      ? await this.prisma.order.count({ where: { customerId } })
      : 0;
    const isNewCustomer = orderCount === 0;

    return (
      candidates.find((popup) => {
        if (isNewCustomer) return popup.showToNewCustomers;
        return (
          popup.returningCustomerMinOrders !== null && orderCount >= popup.returningCustomerMinOrders
        );
      }) ?? null
    );
  }

  async update(id: string, dto: UpdatePopupDto): Promise<PopupWithVoucher> {
    await this.findOne(id);
    if (dto.voucherId) {
      await this.assertVoucherExists(dto.voucherId);
    }
    return this.prisma.popup.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.startAt && { startAt: new Date(dto.startAt) }),
        ...(dto.endAt && { endAt: new Date(dto.endAt) }),
      },
      include: POPUP_INCLUDE,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.popup.delete({ where: { id } });
  }

  private async assertVoucherExists(voucherId: string): Promise<void> {
    const exists = await this.prisma.voucher.findUnique({ where: { id: voucherId }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException('Không tìm thấy voucher');
    }
  }
}
