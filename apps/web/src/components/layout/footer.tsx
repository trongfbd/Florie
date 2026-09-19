import Link from "next/link";
import { getCategories } from "@/lib/api-server";
import { Container } from "./container";

export async function Footer() {
  const categories = await getCategories().catch(() => []);

  return (
    <footer className="border-t border-primary bg-heading text-white">
      <Container className="grid grid-cols-2 gap-8 py-14 text-sm sm:grid-cols-4">
        <div className="col-span-2 space-y-3 sm:col-span-1">
          <p className="font-display text-2xl font-bold text-primary">Bèo Flower Corner</p>
          <p className="text-white/60">Mỗi bó hoa, một câu chuyện.</p>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-white">Danh mục</p>
          <ul className="space-y-2 text-white/60">
            {categories.slice(0, 4).map((category) => (
              <li key={category.id}>
                <Link href={`/danh-muc/${category.slug}`} className="transition-colors hover:text-primary">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-white">Khám phá</p>
          <ul className="space-y-2 text-white/60">
            <li>
              <Link href="/combo" className="transition-colors hover:text-primary">
                Combo hoa
              </Link>
            </li>
            <li>
              <Link href="/flash-sale" className="transition-colors hover:text-primary">
                Flash Sale
              </Link>
            </li>
            <li>
              <Link href="/blog" className="transition-colors hover:text-primary">
                Blog
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-white">Liên hệ</p>
          <ul className="space-y-2 text-white/60">
            <li>Hà Nội, Việt Nam</li>
            <li>0900 000 000</li>
            <li>hello@florie.vn</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Bèo Flower Corner. All rights reserved.
      </div>
    </footer>
  );
}
