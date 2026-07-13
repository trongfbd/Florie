import type { Metadata } from "next";
import { CustomerDetailContent } from "@/features/admin-customers/components/customer-detail-content";

export const metadata: Metadata = { title: "Hồ sơ khách hàng", robots: { index: false } };

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  return <CustomerDetailContent customerId={id} />;
}
