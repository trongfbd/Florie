import Image from "next/image";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api-server";
import { CategoryCard } from "@/features/storefront/components/category-card";
import { ProductGrid } from "@/features/storefront/components/product-grid";
import { FadeIn } from "@/components/motion/fade-in";

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
    getProducts({ sort: "newest", limit: 8 }),
  ]);

  return (
    <div className="space-y-20 pb-20">
      <section className="relative flex min-h-[560px] items-center overflow-hidden">
        <Image
          src={HERO_IMAGE_URL}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-accent/30 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4">
          <FadeIn className="max-w-xl space-y-5">
            <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">
              Florie · Luxury Flower Shop
            </span>
            <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-6xl">
              Mỗi bó hoa,
              <br />
              một câu chuyện
            </h1>
            <p className="max-w-md text-base text-white/85 sm:text-lg">
              Hoa tươi tuyển chọn mỗi ngày, thiết kế tinh tế, giao nhanh trong ngày tại Hà Nội.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/danh-muc/hoa-sinh-nhat"
                className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105"
              >
                Khám phá ngay
              </Link>
              <Link
                href="/tim-kiem"
                className="rounded-full border border-white/40 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Xem tất cả sản phẩm
              </Link>
            </div>
          </FadeIn>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-black/25 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-8 gap-y-2 px-4 py-3 text-xs font-medium text-white/90 sm:justify-between sm:text-sm">
            {TRUST_BADGES.map((badge) => (
              <span key={badge.label} className="flex items-center gap-1.5">
                <span>{badge.icon}</span>
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-20 px-4">
        {categories.length > 0 && (
          <FadeIn as="section" className="space-y-6">
            <div className="text-center">
              <h2 className="font-display text-3xl font-semibold text-foreground">
                Danh mục nổi bật
              </h2>
              <p className="mt-2 text-foreground/60">Chọn hoa theo dịp bạn cần</p>
            </div>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </FadeIn>
        )}

        <FadeIn as="section" delay={0.1} className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-semibold text-foreground">Sản phẩm mới</h2>
              <p className="mt-2 text-foreground/60">Vừa cập nhật tại Florie</p>
            </div>
            <Link
              href="/tim-kiem"
              className="hidden text-sm font-semibold text-accent hover:underline sm:inline"
            >
              Xem tất cả →
            </Link>
          </div>
          <ProductGrid products={featured.data} />
        </FadeIn>
      </div>
    </div>
  );
}
