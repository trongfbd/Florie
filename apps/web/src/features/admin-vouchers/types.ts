export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface Voucher {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
}

export interface VoucherFormInput {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  startAt: string;
  endAt: string;
  isActive?: boolean;
}

export interface PaginatedVouchers {
  data: Voucher[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
