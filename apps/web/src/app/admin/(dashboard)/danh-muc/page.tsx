import type { Metadata } from "next";
import Link from "next/link";
import { CategoriesTable } from "@/features/admin-categories/components/categories-table";

export const metadata: Metadata = { title: "Danh mục", robots: { index: false } };

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-heading">Danh mục</h1>
        <Link
          href="/admin/danh-muc/moi"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105"
        >
          + Thêm danh mục
        </Link>
      </div>
      <CategoriesTable />
    </div>
  );
}
