import type { Metadata } from "next";
import { CreateOrderContent } from "@/features/admin-orders/components/create-order-content";

export const metadata: Metadata = { title: "Thêm đơn hàng", robots: { index: false } };

export default function NewOrderPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Thêm đơn hàng thủ công</h1>
      <CreateOrderContent />
    </div>
  );
}
