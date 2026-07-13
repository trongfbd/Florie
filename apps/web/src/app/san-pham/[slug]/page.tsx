import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/api-server";
import { ProductGallery } from "@/features/storefront/components/product-gallery";
import { ProductGrid } from "@/features/storefront/components/product-grid";
import { Container } from "@/components/layout/container";
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
    <Container className="space-y-20 py-12">
      <div className="grid gap-12 md:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            {product.category.name}
          </p>
          <h1 className="font-display text-4xl font-bold text-heading">{product.name}</h1>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-accent">
              {formatVnd(product.salePrice ?? product.basePrice)}
            </span>
            {hasDiscount && (
              <span className="text-foreground/40 line-through">{formatVnd(product.basePrice)}</span>
            )}
          </div>

          {product.color && (
            <p className="text-sm text-foreground/70">
              Màu sắc: <span className="font-semibold text-heading">{product.color}</span>
            </p>
          )}

          {product.description && (
            <p className="whitespace-pre-line leading-relaxed text-foreground/80">
              {product.description}
            </p>
          )}

          <button
            type="button"
            disabled
            title="Giỏ hàng sẽ có ở bước tiếp theo"
            className="w-full rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-white opacity-60 shadow-lg shadow-accent/30 transition-transform disabled:cursor-not-allowed sm:w-auto sm:px-12"
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      {related.length > 0 && (
        <section className="space-y-6">
          <h2 className="font-display text-3xl font-bold text-heading">Sản phẩm liên quan</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </Container>
  );
}
