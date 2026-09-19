"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCartStore, type CartItemKind } from "@/stores/cart-store";

interface QuickAddToCartButtonProps {
  id: string;
  kind?: CartItemKind;
  name: string;
  slug: string;
  imageUrl: string | null;
  unitPrice: number;
}

// Sits on top of a card that's itself a <Link> to the detail page (product
// grids, combo grids) — preventDefault/stopPropagation keep a click here
// from also triggering that navigation.
export function QuickAddToCartButton({
  id,
  kind = "product",
  name,
  slug,
  imageUrl,
  unitPrice,
}: QuickAddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    addItem({ id, kind, name, slug, imageUrl, unitPrice });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="group/quickadd relative">
      <button
        type="button"
        onClick={handleClick}
        aria-label="Thêm vào giỏ hàng"
        className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 ${
          added ? "bg-success text-white" : "bg-white text-accent hover:bg-accent hover:text-white"
        }`}
      >
        {added ? <Check size={18} /> : <ShoppingBag size={18} />}
      </button>
      <span className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-full bg-heading/90 px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow-md transition-opacity duration-200 group-hover/quickadd:opacity-100">
        {added ? "Đã thêm" : "Mua"}
      </span>
    </div>
  );
}
