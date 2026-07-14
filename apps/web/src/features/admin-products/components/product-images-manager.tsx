"use client";

import Image from "next/image";
import { useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { getErrorMessage } from "@/lib/get-error-message";
import { useAddProductImage, useDeleteProductImage } from "../hooks";
import type { ProductImage } from "../types";

export function ProductImagesManager({ productId, images }: { productId: string; images: ProductImage[] }) {
  const addImage = useAddProductImage(productId);
  const deleteImage = useDeleteProductImage(productId);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    try {
      await addImage.mutateAsync(file);
    } catch (err) {
      setError(getErrorMessage(err, "Tải ảnh thất bại — vui lòng thử lại."));
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-heading">Ảnh sản phẩm</label>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((image) => (
          <div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg border-2 border-secondary bg-secondary">
            <Image src={image.url} alt={image.altText ?? ""} fill sizes="150px" className="object-cover" />
            <button
              type="button"
              onClick={() => deleteImage.mutate(image.id)}
              aria-label="Xoá ảnh"
              className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-secondary text-foreground/50 transition-colors hover:border-accent hover:text-accent">
          {addImage.isPending ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
          <span className="text-xs font-semibold">Thêm ảnh</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={addImage.isPending}
            className="hidden"
          />
        </label>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
