import type { Metadata } from "next";
import { VoucherForm } from "@/features/admin-vouchers/components/voucher-form";

export const metadata: Metadata = { title: "Thêm voucher", robots: { index: false } };

export default function NewVoucherPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Thêm voucher</h1>
      <VoucherForm />
    </div>
  );
}
