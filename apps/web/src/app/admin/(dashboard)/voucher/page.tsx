import type { Metadata } from "next";
import Link from "next/link";
import { VouchersTable } from "@/features/admin-vouchers/components/vouchers-table";

export const metadata: Metadata = { title: "Voucher", robots: { index: false } };

export default function AdminVouchersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-heading">Voucher</h1>
        <Link
          href="/admin/voucher/moi"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105"
        >
          + Thêm voucher
        </Link>
      </div>
      <VouchersTable />
    </div>
  );
}
