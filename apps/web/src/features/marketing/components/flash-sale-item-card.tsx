import Image from "next/image";
import Link from "next/link";
import { formatVnd } from "@/lib/format";
import type { FlashSaleItem } from "../types";

export function FlashSaleItemCard({ item }: { item: FlashSaleItem }) {
  const image = item.product.images[0];
  const percentOff = Math.round(((item.product.basePrice - item.salePrice) / item.product.basePrice) * 100);
  const soldOut = item.quantityLimit !== null && item.soldQuantity >= item.quantityLimit;
  const progress =
    item.quantityLimit !== null ? Math.min(100, Math.round((item.soldQuantity / item.quantityLimit) * 100)) : null;

  return (
    <Link
      href={`/san-pham/${item.product.slug}`}
      className="group block overflow-hidden rounded-brand border-2 border-secondary bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary hover:shadow-xl hover:shadow-accent/10"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {image ? (
          <Image
            src={image.url}
            alt={item.product.name}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-foreground/40">Chưa có ảnh</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-white shadow-md">
          -{percentOff}%
        </span>
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-heading">Đã bán hết</span>
          </div>
        )}
      </div>

      <div className="space-y-1.5 p-4">
        <h3 className="line-clamp-1 font-display text-base font-semibold text-heading">{item.product.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-accent">{formatVnd(item.salePrice)}</span>
          <span className="text-sm text-foreground/40 line-through">{formatVnd(item.product.basePrice)}</span>
        </div>
        {progress !== null && (
          <div className="space-y-1 pt-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-foreground/50">Đã bán {item.soldQuantity}/{item.quantityLimit}</p>
          </div>
        )}
      </div>
    </Link>
  );
}
