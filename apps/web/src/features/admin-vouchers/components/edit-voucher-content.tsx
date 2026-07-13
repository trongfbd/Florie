"use client";

import { useVoucher } from "../hooks";
import { VoucherForm } from "./voucher-form";

export function EditVoucherContent({ id }: { id: string }) {
  const { data: voucher, isLoading } = useVoucher(id);

  if (isLoading || !voucher) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  return <VoucherForm voucher={voucher} />;
}
