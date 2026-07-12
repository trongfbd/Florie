import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts } from "@/lib/api-server";
import { FilterBar } from "@/features/storefront/components/filter-bar";
import { ProductGrid } from "@/features/storefront/components/product-grid";
import { Pagination } from "@/features/storefront/components/pagination";
import type { StorefrontProductQuery } from "@/features/storefront/types";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {};
  }

  return {
    title: category.seoTitle ?? category.name,
    description: category.seoDescription ?? category.description ?? undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const page = sp.page ? Number(sp.page) : 1;
  const products = await getProducts({
    categorySlug: slug,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    sort: (sp.sort as StorefrontProductQuery["sort"]) ?? "newest",
    page,
    limit: 12,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">{category.name}</h1>
        {category.description && (
          <p className="mt-2 max-w-2xl text-foreground/70">{category.description}</p>
        )}
      </div>

      <FilterBar />

      <ProductGrid products={products.data} />

      <Pagination
        basePath={`/danh-muc/${slug}`}
        searchParams={sp}
        page={products.meta.page}
        totalPages={products.meta.totalPages}
      />
    </div>
  );
}
