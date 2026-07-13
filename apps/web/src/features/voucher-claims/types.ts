export interface ClaimedVoucher {
  id: string;
  voucherId: string;
  claimedAt: string;
  voucher: {
    id: string;
    code: string;
    description: string | null;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
    minOrderValue: number;
    maxDiscountAmount: number | null;
    endAt: string;
  };
}
