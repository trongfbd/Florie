import type { Metadata } from "next";
import { ProductForm } from "@/features/admin-products/components/product-form";

export const metadata: Metadata = { title: "Thêm sản phẩm", robots: { index: false } };

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Thêm sản phẩm</h1>
      <ProductForm />
    </div>
  );
}
