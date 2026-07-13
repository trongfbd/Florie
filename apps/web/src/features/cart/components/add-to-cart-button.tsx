"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/cart-store";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  unitPrice: number;
}

export function AddToCartButton({ productId, name, slug, imageUrl, unitPrice }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem({ productId, name, slug, imageUrl, unitPrice });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-all hover:scale-[1.02] hover:shadow-xl sm:w-auto sm:px-12"
    >
      {added ? "Đã thêm vào giỏ ✓" : "Thêm vào giỏ hàng"}
    </button>
  );
}
