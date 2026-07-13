import type { Metadata } from "next";
import { CategoryForm } from "@/features/admin-categories/components/category-form";

export const metadata: Metadata = { title: "Thêm danh mục", robots: { index: false } };

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Thêm danh mục</h1>
      <CategoryForm />
    </div>
  );
}
