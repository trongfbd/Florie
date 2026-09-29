import type { Metadata } from "next";
import { OrderDetailPageContent } from "@/features/admin-orders/components/order-detail-page-content";

export const metadata: Metadata = { title: "Chi tiết đơn hàng", robots: { index: false } };

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  return <OrderDetailPageContent orderId={id} />;
}
