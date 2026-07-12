import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/api-server";
import { ProductGallery } from "@/features/storefront/components/product-gallery";
import { ProductGrid } from "@/features/storefront/components/product-grid";
import { formatVnd } from "@/lib/format";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {};
  }

  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(slug);
  const hasDiscount = product.salePrice !== null && product.salePrice < product.basePrice;

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="space-y-4">
          <p className="text-xs uppercase tracking-wide text-accent">{product.category.name}</p>
          <h1 className="font-display text-3xl font-semibold text-foreground">{product.name}</h1>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-accent">
              {formatVnd(product.salePrice ?? product.basePrice)}
            </span>
            {hasDiscount && (
              <span className="text-foreground/40 line-through">{formatVnd(product.basePrice)}</span>
            )}
          </div>

          {product.color && (
            <p className="text-sm text-foreground/70">
              Màu sắc: <span className="font-medium text-foreground">{product.color}</span>
            </p>
          )}

          {product.description && (
            <p className="whitespace-pre-line text-foreground/80">{product.description}</p>
          )}

          <button
            type="button"
            disabled
            title="Giỏ hàng sẽ có ở bước tiếp theo"
            className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white opacity-60 transition-transform disabled:cursor-not-allowed sm:w-auto sm:px-10"
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      {related.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold text-foreground">Sản phẩm liên quan</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
