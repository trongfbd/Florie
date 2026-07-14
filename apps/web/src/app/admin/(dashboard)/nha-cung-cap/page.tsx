import type { Metadata } from "next";
import Link from "next/link";
import { SuppliersTable } from "@/features/admin-suppliers/components/suppliers-table";

export const metadata: Metadata = { title: "Nhà cung cấp", robots: { index: false } };

export default function AdminSuppliersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-heading">Nhà cung cấp</h1>
        <Link
          href="/admin/nha-cung-cap/moi"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105"
        >
          + Thêm nhà cung cấp
        </Link>
      </div>
      <SuppliersTable />
    </div>
  );
}
