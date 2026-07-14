import type { Metadata } from "next";
import { MaterialForm } from "@/features/admin-materials/components/material-form";

export const metadata: Metadata = { title: "Thêm vật tư", robots: { index: false } };

export default function NewMaterialPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Thêm vật tư</h1>
      <MaterialForm />
    </div>
  );
}
