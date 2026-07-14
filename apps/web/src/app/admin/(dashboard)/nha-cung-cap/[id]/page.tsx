import type { Metadata } from "next";
import { EditSupplierContent } from "@/features/admin-suppliers/components/edit-supplier-content";

export const metadata: Metadata = { title: "Sửa nhà cung cấp", robots: { index: false } };

interface EditSupplierPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSupplierPage({ params }: EditSupplierPageProps) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Sửa nhà cung cấp</h1>
      <EditSupplierContent id={id} />
    </div>
  );
}
