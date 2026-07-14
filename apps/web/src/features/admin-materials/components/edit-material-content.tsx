"use client";

import { useMaterial } from "../hooks";
import { MaterialForm } from "./material-form";
import { StockImportPanel } from "./stock-import-panel";

export function EditMaterialContent({ id }: { id: string }) {
  const { data: material, isLoading } = useMaterial(id);

  if (isLoading || !material) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  return (
    <div className="space-y-6">
      <MaterialForm material={material} />
      <StockImportPanel material={material} />
    </div>
  );
}
