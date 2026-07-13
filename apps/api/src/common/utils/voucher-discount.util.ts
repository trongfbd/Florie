import { BadRequestException } from '@nestjs/common';
import { DiscountType, Voucher } from '@prisma/client';

/**
 * Single source of truth for voucher validation + discount math, shared by
 * order creation (orders.service.ts) and the storefront preview endpoint
 * (vouchers.service.ts) so the two can never drift apart.
 */
export function computeVoucherDiscount(voucher: Voucher, subtotal: number): number {
  if (!voucher.isActive) {
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

  return discountAmount;
}
