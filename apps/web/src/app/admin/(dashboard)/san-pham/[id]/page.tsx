import type { Metadata } from "next";
import { EditProductContent } from "@/features/admin-products/components/edit-product-content";

export const metadata: Metadata = { title: "Sửa sản phẩm", robots: { index: false } };

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Sửa sản phẩm</h1>
      <EditProductContent id={id} />
    </div>
  );
}
