import Image from "next/image";
import Link from "next/link";
import type { CategorySummary } from "../types";

export function CategoryCard({ category }: { category: CategorySummary }) {
  return (
    <Link
      href={`/danh-muc/${category.slug}`}
      className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-brand bg-secondary shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      {category.imageUrl ? (
        <Image
          src={category.imageUrl}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent" />
      <div className="relative z-10 p-4">
        <h3 className="font-display text-lg font-semibold text-white drop-shadow">
          {category.name}
        </h3>
        <p className="text-xs text-white/80">{category._count.products} sản phẩm</p>
      </div>
    </Link>
  );
}
