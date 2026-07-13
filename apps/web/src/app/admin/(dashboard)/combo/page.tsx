import type { Metadata } from "next";
import Link from "next/link";
import { CombosTable } from "@/features/admin-combos/components/combos-table";

export const metadata: Metadata = { title: "Combo", robots: { index: false } };

export default function AdminCombosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-heading">Combo</h1>
        <Link
          href="/admin/combo/moi"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105"
        >
          + Thêm combo
        </Link>
      </div>
      <CombosTable />
    </div>
  );
}
