import type { Metadata } from "next";
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { OrderDeliverySlipView } from "@/features/admin-orders/components/order-delivery-slip-view";

export const metadata: Metadata = { title: "Phiếu giao hàng", robots: { index: false } };

export default async function AdminDeliverySlipPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <AdminAuthGuard>
      <OrderDeliverySlipView orderId={orderId} />
    </AdminAuthGuard>
  );
}
