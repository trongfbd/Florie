import Image from "next/image";
import Link from "next/link";
import { formatVnd } from "@/lib/format";
import type { ProductListItem } from "../types";

export function ProductCard({ product }: { product: ProductListItem }) {
  const image = product.images[0];
  const hasDiscount = product.salePrice !== null && product.salePrice < product.basePrice;

  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="group block overflow-hidden rounded-brand border-2 border-secondary bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary hover:shadow-xl hover:shadow-accent/10"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-foreground/40">
            Chưa có ảnh
          </div>
        )}
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-white shadow-md">
            Giảm giá
          </span>
        )}
      </div>

      <div className="space-y-1.5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          {product.category.name}
        </p>
        <h3 className="line-clamp-1 font-display text-base font-semibold text-heading">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-heading">
            {formatVnd(product.salePrice ?? product.basePrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-foreground/40 line-through">
              {formatVnd(product.basePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
