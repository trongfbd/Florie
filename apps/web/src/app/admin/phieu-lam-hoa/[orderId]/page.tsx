import type { Metadata } from "next";
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { OrderFloristSlipView } from "@/features/admin-orders/components/order-florist-slip-view";

export const metadata: Metadata = { title: "Phiếu làm hoa", robots: { index: false } };

export default async function AdminFloristSlipPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <AdminAuthGuard>
      <OrderFloristSlipView orderId={orderId} />
    </AdminAuthGuard>
  );
}
