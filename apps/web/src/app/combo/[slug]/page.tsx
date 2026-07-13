import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getComboBySlug } from "@/lib/api-server";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { Container } from "@/components/layout/container";
import { formatVnd } from "@/lib/format";

interface ComboPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ComboPageProps): Promise<Metadata> {
  const { slug } = await params;
  const combo = await getComboBySlug(slug);

  if (!combo) {
    return {};
  }

  return { title: combo.name, description: combo.description ?? undefined };
}

export default async function ComboDetailPage({ params }: ComboPageProps) {
  const { slug } = await params;
  const combo = await getComboBySlug(slug);

  if (!combo) {
    notFound();
  }

  const coverImage = combo.imageUrl ?? combo.items[0]?.product.images[0]?.url ?? null;

  return (
    <Container className="space-y-16 py-12">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-brand border-2 border-secondary bg-secondary">
          {coverImage ? (
            <Image src={coverImage} alt={combo.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-foreground/40">Chưa có ảnh</div>
          )}
        </div>

        <div className="space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Combo hoa</p>
          <h1 className="font-display text-4xl font-bold text-heading">{combo.name}</h1>
          <span className="text-3xl font-bold text-accent">{formatVnd(combo.price)}</span>

          {combo.description && (
            <p className="whitespace-pre-line leading-relaxed text-foreground/80">{combo.description}</p>
          )}

          <AddToCartButton
            id={combo.id}
            kind="combo"
            name={combo.name}
            slug={combo.slug}
            imageUrl={coverImage}
            unitPrice={combo.price}
          />
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-heading">Sản phẩm trong combo</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {combo.items.map((item) => (
            <Link
              key={item.id}
              href={`/san-pham/${item.product.slug}`}
              className="group overflow-hidden rounded-brand border-2 border-secondary bg-white transition-colors hover:border-primary"
            >
              <div className="relative aspect-square overflow-hidden bg-secondary">
                {item.product.images[0] ? (
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-foreground/40">Chưa có ảnh</div>
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-1 text-sm font-semibold text-heading">{item.product.name}</p>
                <p className="text-xs text-foreground/60">Số lượng: {item.quantity}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Container>
  );
}
