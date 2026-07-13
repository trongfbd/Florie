import type { Metadata } from "next";
import Link from "next/link";
import { BannersTable } from "@/features/admin-banners/components/banners-table";

export const metadata: Metadata = { title: "Banner", robots: { index: false } };

export default function AdminBannersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-heading">Banner</h1>
        <Link
          href="/admin/banner/moi"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105"
        >
          + Thêm banner
        </Link>
      </div>
      <BannersTable />
    </div>
  );
}
