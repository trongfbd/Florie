import type { Metadata } from "next";
import { EditCategoryContent } from "@/features/admin-categories/components/edit-category-content";

export const metadata: Metadata = { title: "Sửa danh mục", robots: { index: false } };

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Sửa danh mục</h1>
      <EditCategoryContent id={id} />
    </div>
  );
}
