import Image from "next/image";
import Link from "next/link";
import { formatVnd } from "@/lib/format";
import type { Combo } from "../types";

export function ComboCard({ combo }: { combo: Combo }) {
  const image = combo.imageUrl ?? combo.items[0]?.product.images[0]?.url ?? null;

  return (
    <Link
      href={`/combo/${combo.slug}`}
      className="group block overflow-hidden rounded-brand border-2 border-secondary bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary hover:shadow-xl hover:shadow-accent/10"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {image ? (
          <Image
            src={image}
            alt={combo.name}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-foreground/40">
            Chưa có ảnh
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-white shadow-md">
          Combo
        </span>
      </div>

      <div className="space-y-1.5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          {combo.items.length} sản phẩm
        </p>
        <h3 className="line-clamp-1 font-display text-base font-semibold text-heading">
          {combo.name}
        </h3>
        <span className="font-bold text-heading">{formatVnd(combo.price)}</span>
      </div>
    </Link>
  );
}
