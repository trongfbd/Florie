import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts } from "@/lib/api-server";
import { FilterBar } from "@/features/storefront/components/filter-bar";
import { ProductGrid } from "@/features/storefront/components/product-grid";
import { Pagination } from "@/features/storefront/components/pagination";
import { Container } from "@/components/layout/container";
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
    limit: 15,
  });

  return (
    <div className="pb-24">
      <section className="relative flex h-64 items-end overflow-hidden sm:h-80">
        {category.imageUrl ? (
          <Image src={category.imageUrl} alt="" fill sizes="100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <Container className="relative z-10 pb-8">
          <h1 className="font-display text-4xl font-bold text-white drop-shadow sm:text-5xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-2 max-w-xl text-white/85">{category.description}</p>
          )}
        </Container>
      </section>

      <Container className="mt-8 space-y-6">
        <FilterBar />
        <ProductGrid products={products.data} />
        <Pagination
          basePath={`/danh-muc/${slug}`}
          searchParams={sp}
          page={products.meta.page}
          totalPages={products.meta.totalPages}
        />
      </Container>
    </div>
  );
}
