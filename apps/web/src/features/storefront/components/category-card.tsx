import Image from "next/image";
import Link from "next/link";
import type { CategorySummary } from "../types";

export function CategoryCard({ category }: { category: CategorySummary }) {
  return (
    <Link
      href={`/danh-muc/${category.slug}`}
      className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-brand bg-secondary shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      {category.imageUrl ? (
        <Image
          src={category.imageUrl}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-colors duration-300 group-hover:from-black/80" />
      <div className="relative z-10 p-5">
        <h3 className="font-display text-xl font-bold text-white drop-shadow-sm">
          {category.name}
        </h3>
        <p className="mt-0.5 text-xs font-medium text-white/85">
          {category._count.products} sản phẩm
        </p>
      </div>
    </Link>
  );
}
