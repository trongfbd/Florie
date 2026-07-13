import type { Metadata } from "next";
import { OrdersTable } from "@/features/admin-orders/components/orders-table";

export const metadata: Metadata = { title: "Đơn hàng", robots: { index: false } };

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Đơn hàng</h1>
      <OrdersTable />
    </div>
  );
}
