"use client";

import { useProduct } from "../hooks";
import { ProductForm } from "./product-form";

export function EditProductContent({ id }: { id: string }) {
  const { data: product, isLoading } = useProduct(id);

  if (isLoading || !product) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  return <ProductForm product={product} />;
}
