import type { Metadata } from "next";
import { getProducts } from "@/lib/api-server";
import { FilterBar } from "@/features/storefront/components/filter-bar";
import { ProductGrid } from "@/features/storefront/components/product-grid";
import { Pagination } from "@/features/storefront/components/pagination";
import type { StorefrontProductQuery } from "@/features/storefront/types";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export function generateMetadata(): Metadata {
  return {
    title: "Tìm kiếm sản phẩm",
    robots: { index: false }, // search-result pages add little unique SEO value
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const query = sp.q ?? "";
  const page = sp.page ? Number(sp.page) : 1;

  const products = query
    ? await getProducts({
        search: query,
        minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
        maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
        sort: (sp.sort as StorefrontProductQuery["sort"]) ?? "newest",
        page,
        limit: 12,
      })
    : await getProducts({ sort: "newest", page, limit: 12 });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">
          {query ? `Kết quả cho "${query}"` : "Tất cả sản phẩm"}
        </h1>
        <p className="mt-1 text-sm text-foreground/60">{products.meta.total} sản phẩm</p>
      </div>

      <FilterBar />

      <ProductGrid products={products.data} />

      <Pagination
        basePath="/tim-kiem"
        searchParams={sp}
        page={products.meta.page}
        totalPages={products.meta.totalPages}
      />
    </div>
  );
}
