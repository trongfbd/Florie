import type { Metadata } from "next";
import { EditPopupContent } from "@/features/admin-popups/components/edit-popup-content";

export const metadata: Metadata = { title: "Sửa popup", robots: { index: false } };

interface EditPopupPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPopupPage({ params }: EditPopupPageProps) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Sửa popup</h1>
      <EditPopupContent id={id} />
    </div>
  );
}
