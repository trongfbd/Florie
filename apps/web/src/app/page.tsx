import Image from "next/image";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api-server";
import { CategoryCard } from "@/features/storefront/components/category-card";
import { ProductGrid } from "@/features/storefront/components/product-grid";
import { FadeIn } from "@/components/motion/fade-in";
import { Container } from "@/components/layout/container";

// Hero photo is hardcoded until the Marketing sprint adds real Banner
// management (Banner model already exists in the schema, no CRUD API yet).
const HERO_IMAGE_URL =
  "http://localhost:9000/florie-media/banners/8a2a5d60-4db7-4210-94f8-03d335c228cb.jpg";

const TRUST_BADGES = [
  { icon: "🌸", label: "Hoa tươi mỗi ngày" },
  { icon: "🚚", label: "Giao trong 2 giờ" },
  { icon: "💝", label: "Thiết kế theo yêu cầu" },
  { icon: "🔒", label: "Thanh toán an toàn" },
];

export default async function Home() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getProducts({ sort: "newest", limit: 10 }),
  ]);

  return (
    <div className="space-y-24 pb-24">
      <section className="relative flex min-h-[620px] items-center overflow-hidden">
        <Image
          src={HERO_IMAGE_URL}
          alt=""
          fill
          priority
          sizes="100vw"
          className="animate-hero-zoom object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-heading/40 via-transparent to-transparent" />

        <Container className="relative z-10">
          <FadeIn className="max-w-xl space-y-6">
            <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">
              Florie · Luxury Flower Shop
            </span>
            <h1 className="font-display text-5xl font-bold leading-[1.1] text-white sm:text-7xl">
              Mỗi bó hoa,
              <br />
              một câu chuyện
            </h1>
            <p className="max-w-md text-base text-white/90 sm:text-lg">
              Hoa tươi tuyển chọn mỗi ngày, thiết kế tinh tế, giao nhanh trong ngày tại Hà Nội.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/danh-muc/hoa-sinh-nhat"
                className="rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-accent/40 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-accent/50"
              >
                Khám phá ngay
              </Link>
              <Link
                href="/tim-kiem"
                className="rounded-full border-2 border-white/70 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-white hover:bg-white hover:text-heading"
              >
                Xem tất cả sản phẩm
              </Link>
            </div>
          </FadeIn>
        </Container>

        <div className="absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-black/35 backdrop-blur-sm">
          <Container className="flex flex-wrap justify-center gap-x-8 gap-y-2 py-3.5 text-xs font-semibold text-white sm:justify-between sm:text-sm">
            {TRUST_BADGES.map((badge) => (
              <span key={badge.label} className="flex items-center gap-1.5">
                <span>{badge.icon}</span>
                {badge.label}
              </span>
            ))}
          </Container>
        </div>
      </section>

      <Container className="space-y-24">
        {categories.length > 0 && (
          <FadeIn as="section" className="space-y-8">
            <div className="text-center">
              <h2 className="font-display text-4xl font-bold text-heading">Danh mục nổi bật</h2>
              <p className="mt-2 text-foreground/70">Chọn hoa theo dịp bạn cần</p>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </FadeIn>
        )}

        <FadeIn as="section" delay={0.1} className="space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-4xl font-bold text-heading">Sản phẩm mới</h2>
              <p className="mt-2 text-foreground/70">Vừa cập nhật tại Florie</p>
            </div>
            <Link
              href="/tim-kiem"
              className="hidden text-sm font-bold text-accent hover:underline sm:inline"
            >
              Xem tất cả →
            </Link>
          </div>
          <ProductGrid products={featured.data} />
        </FadeIn>
      </Container>
    </div>
  );
}
