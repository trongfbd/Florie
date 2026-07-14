"use client";

import { useSupplier } from "../hooks";
import { SupplierForm } from "./supplier-form";

export function EditSupplierContent({ id }: { id: string }) {
  const { data: supplier, isLoading } = useSupplier(id);

  if (isLoading || !supplier) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  return <SupplierForm supplier={supplier} />;
}
