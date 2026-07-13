import type { Metadata } from "next";
import Link from "next/link";
import { FlashSalesTable } from "@/features/admin-flash-sales/components/flash-sales-table";

export const metadata: Metadata = { title: "Flash Sale", robots: { index: false } };

export default function AdminFlashSalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-heading">Flash Sale</h1>
        <Link
          href="/admin/flash-sale/moi"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105"
        >
          + Thêm flash sale
        </Link>
      </div>
      <FlashSalesTable />
    </div>
  );
}
