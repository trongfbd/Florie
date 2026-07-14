import type { Metadata } from "next";
import Link from "next/link";
import { MaterialsTable } from "@/features/admin-materials/components/materials-table";

export const metadata: Metadata = { title: "Vật tư", robots: { index: false } };

export default function AdminMaterialsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-heading">Vật tư</h1>
        <Link
          href="/admin/vat-tu/moi"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105"
        >
          + Thêm vật tư
        </Link>
      </div>
      <MaterialsTable />
    </div>
  );
}
