"use client";

import { useFlashSale } from "../hooks";
import { FlashSaleForm } from "./flash-sale-form";

export function EditFlashSaleContent({ id }: { id: string }) {
  const { data: flashSale, isLoading } = useFlashSale(id);

  if (isLoading || !flashSale) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  return <FlashSaleForm flashSale={flashSale} />;
}
