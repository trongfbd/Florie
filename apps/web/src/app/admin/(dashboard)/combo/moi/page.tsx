import type { Metadata } from "next";
import { ComboForm } from "@/features/admin-combos/components/combo-form";

export const metadata: Metadata = { title: "Thêm combo", robots: { index: false } };

export default function NewComboPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Thêm combo</h1>
      <ComboForm />
    </div>
  );
}
