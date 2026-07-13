import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const CLAIM_INCLUDE = {
  voucher: {
    select: {
      id: true,
      code: true,
      description: true,
      discountType: true,
      discountValue: true,
      minOrderValue: true,
      maxDiscountAmount: true,
      endAt: true,
    },
  },
} satisfies Prisma.VoucherClaimInclude;

type ClaimWithVoucher = Prisma.VoucherClaimGetPayload<{ include: typeof CLAIM_INCLUDE }>;

@Injectable()
export class VoucherClaimsService {
  constructor(private readonly prisma: PrismaService) {}

  async claim(popupId: string, customerId: string): Promise<ClaimWithVoucher> {
    const popup = await this.prisma.popup.findUnique({ where: { id: popupId } });
    if (!popup || !popup.voucherId) {
      throw new NotFoundException('Không tìm thấy chương trình ưu đãi này');
    }

    const voucher = await this.prisma.voucher.findUnique({ where: { id: popup.voucherId } });
    if (!voucher) {
      throw new NotFoundException('Không tìm thấy voucher');
    }

    const now = new Date();
    if (!voucher.isActive || now < voucher.startAt || now > voucher.endAt) {
      throw new BadRequestException('Chương trình ưu đãi này đã kết thúc');
    }

    const existing = await this.prisma.voucherClaim.findUnique({
      where: { voucherId_customerId: { voucherId: voucher.id, customerId } },
      include: CLAIM_INCLUDE,
    });
    if (existing) {
      return existing;
    }

    return this.prisma.voucherClaim.create({
      data: { voucherId: voucher.id, customerId, popupId },
      include: CLAIM_INCLUDE,
    });
  }

  listForCustomer(customerId: string): Promise<ClaimWithVoucher[]> {
    return this.prisma.voucherClaim.findMany({
      where: { customerId },
      include: CLAIM_INCLUDE,
      orderBy: { claimedAt: 'desc' },
    });
  }
}
