import type { Metadata } from "next";
import Link from "next/link";
import { ProductsTable } from "@/features/admin-products/components/products-table";

export const metadata: Metadata = { title: "Sản phẩm", robots: { index: false } };

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-heading">Sản phẩm</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/san-pham/import"
            className="rounded-full border-2 border-secondary px-5 py-2.5 text-sm font-bold text-heading transition-colors hover:bg-secondary"
          >
            Nhập từ Excel
          </Link>
          <Link
            href="/admin/san-pham/moi"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105"
          >
            + Thêm sản phẩm
          </Link>
        </div>
      </div>
      <ProductsTable />
    </div>
  );
}
