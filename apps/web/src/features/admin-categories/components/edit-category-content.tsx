"use client";

import { useCategory } from "../hooks";
import { CategoryForm } from "./category-form";

export function EditCategoryContent({ id }: { id: string }) {
  const { data: category, isLoading } = useCategory(id);

  if (isLoading || !category) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  return <CategoryForm category={category} />;
}
