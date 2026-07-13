import type { Metadata } from "next";
import { EditFlashSaleContent } from "@/features/admin-flash-sales/components/edit-flash-sale-content";

export const metadata: Metadata = { title: "Sửa flash sale", robots: { index: false } };

interface EditFlashSalePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFlashSalePage({ params }: EditFlashSalePageProps) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Sửa flash sale</h1>
      <EditFlashSaleContent id={id} />
    </div>
  );
}
