import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, getReviews } from "@/lib/api-server";
import { ProductGallery } from "@/features/storefront/components/product-gallery";
import { ProductGrid } from "@/features/storefront/components/product-grid";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { WishlistButton } from "@/features/wishlist/components/wishlist-button";
import { ReviewsSection } from "@/features/reviews/components/reviews-section";
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

  const [related, reviews] = await Promise.all([getRelatedProducts(slug), getReviews(slug)]);
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

          <div className="flex gap-3">
            <AddToCartButton
              productId={product.id}
              name={product.name}
              slug={product.slug}
              imageUrl={product.images[0]?.url ?? null}
              unitPrice={product.salePrice ?? product.basePrice}
            />
            <WishlistButton productId={product.id} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="space-y-6">
          <h2 className="font-display text-3xl font-bold text-heading">Sản phẩm liên quan</h2>
          <ProductGrid products={related} />
        </section>
      )}

      <ReviewsSection productSlug={slug} initialReviews={reviews} />
    </Container>
  );
}
