import type { Metadata } from "next";
import { EditMaterialContent } from "@/features/admin-materials/components/edit-material-content";

export const metadata: Metadata = { title: "Sửa vật tư", robots: { index: false } };

interface EditMaterialPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMaterialPage({ params }: EditMaterialPageProps) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Sửa vật tư</h1>
      <EditMaterialContent id={id} />
    </div>
  );
}
