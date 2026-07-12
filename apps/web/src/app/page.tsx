import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api-server";
import { CategoryCard } from "@/features/storefront/components/category-card";
import { ProductGrid } from "@/features/storefront/components/product-grid";

export default async function Home() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getProducts({ sort: "newest", limit: 8 }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-10">
      <section className="flex flex-col items-center gap-4 rounded-brand bg-secondary px-6 py-16 text-center">
        <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold tracking-wide text-foreground">
          Florie · Flower Shop
        </span>
        <h1 className="font-display text-4xl font-semibold text-foreground sm:text-5xl">
          Mỗi bó hoa, một câu chuyện
        </h1>
        <p className="max-w-xl text-foreground/70">
          Hoa tươi mỗi ngày, thiết kế tinh tế, giao nhanh trong ngày tại Hà Nội.
        </p>
        <Link
          href="/danh-muc/hoa-sinh-nhat"
          className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
        >
          Khám phá ngay
        </Link>
      </section>

      {categories.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold text-foreground">Danh mục nổi bật</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-foreground">Sản phẩm mới</h2>
          <Link href="/tim-kiem" className="text-sm font-medium text-accent hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <ProductGrid products={featured.data} />
      </section>
    </div>
  );
}
