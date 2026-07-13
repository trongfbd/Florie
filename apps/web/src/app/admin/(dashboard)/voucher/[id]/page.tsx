import type { Metadata } from "next";
import { EditVoucherContent } from "@/features/admin-vouchers/components/edit-voucher-content";

export const metadata: Metadata = { title: "Sửa voucher", robots: { index: false } };

interface EditVoucherPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVoucherPage({ params }: EditVoucherPageProps) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Sửa voucher</h1>
      <EditVoucherContent id={id} />
    </div>
  );
}
