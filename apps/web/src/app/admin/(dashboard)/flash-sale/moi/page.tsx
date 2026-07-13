import type { Metadata } from "next";
import { FlashSaleForm } from "@/features/admin-flash-sales/components/flash-sale-form";

export const metadata: Metadata = { title: "Thêm flash sale", robots: { index: false } };

export default function NewFlashSalePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Thêm flash sale</h1>
      <FlashSaleForm />
    </div>
  );
}
