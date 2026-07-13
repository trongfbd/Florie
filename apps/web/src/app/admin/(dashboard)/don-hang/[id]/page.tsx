import type { Metadata } from "next";
import { OrderDetailContent } from "@/features/admin-orders/components/order-detail-content";

export const metadata: Metadata = { title: "Chi tiết đơn hàng", robots: { index: false } };

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  return <OrderDetailContent orderId={id} />;
}
