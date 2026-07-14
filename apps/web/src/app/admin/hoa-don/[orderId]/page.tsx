import type { Metadata } from "next";
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { OrderInvoiceView } from "@/features/admin-orders/components/order-invoice-view";

export const metadata: Metadata = { title: "Hóa đơn", robots: { index: false } };

export default async function AdminOrderInvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <AdminAuthGuard>
      <OrderInvoiceView orderId={orderId} />
    </AdminAuthGuard>
  );
}
