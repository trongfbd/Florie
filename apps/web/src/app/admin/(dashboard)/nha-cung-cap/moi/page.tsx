import type { Metadata } from "next";
import { SupplierForm } from "@/features/admin-suppliers/components/supplier-form";

export const metadata: Metadata = { title: "Thêm nhà cung cấp", robots: { index: false } };

export default function NewSupplierPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Thêm nhà cung cấp</h1>
      <SupplierForm />
    </div>
  );
}
