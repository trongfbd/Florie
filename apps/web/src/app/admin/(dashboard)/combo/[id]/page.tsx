import type { Metadata } from "next";
import { EditComboContent } from "@/features/admin-combos/components/edit-combo-content";

export const metadata: Metadata = { title: "Sửa combo", robots: { index: false } };

interface EditComboPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditComboPage({ params }: EditComboPageProps) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Sửa combo</h1>
      <EditComboContent id={id} />
    </div>
  );
}
