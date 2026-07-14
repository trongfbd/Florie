"use client";

import { useVoucher } from "../hooks";
import { VoucherForm } from "./voucher-form";
import { VoucherUsageTable } from "./voucher-usage-table";

export function EditVoucherContent({ id }: { id: string }) {
  const { data: voucher, isLoading } = useVoucher(id);

  if (isLoading || !voucher) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  return (
    <div className="space-y-6">
      <VoucherForm voucher={voucher} />
      <VoucherUsageTable voucherId={id} />
    </div>
  );
}
