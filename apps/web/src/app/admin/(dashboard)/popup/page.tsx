import type { Metadata } from "next";
import Link from "next/link";
import { PopupsTable } from "@/features/admin-popups/components/popups-table";

export const metadata: Metadata = { title: "Popup", robots: { index: false } };

export default function AdminPopupsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-heading">Popup</h1>
        <Link
          href="/admin/popup/moi"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105"
        >
          + Thêm popup
        </Link>
      </div>
      <PopupsTable />
    </div>
  );
}
