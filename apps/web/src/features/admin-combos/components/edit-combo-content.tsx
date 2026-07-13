"use client";

import { useCombo } from "../hooks";
import { ComboForm } from "./combo-form";

export function EditComboContent({ id }: { id: string }) {
  const { data: combo, isLoading } = useCombo(id);

  if (isLoading || !combo) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  return <ComboForm combo={combo} />;
}
