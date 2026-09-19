import type { Metadata } from "next";
import { ImportExcelContent } from "@/features/admin-products/components/import-excel-content";

export const metadata: Metadata = { title: "Nhập sản phẩm từ Excel", robots: { index: false } };

export default function ImportProductsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Nhập sản phẩm từ Excel</h1>
      <ImportExcelContent />
    </div>
  );
}
