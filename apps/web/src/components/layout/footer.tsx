import Link from "next/link";
import { getCategories } from "@/lib/api-server";

export async function Footer() {
  const categories = await getCategories().catch(() => []);

  return (
    <footer className="border-t border-primary/60 bg-foreground text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 text-sm sm:grid-cols-4">
        <div className="col-span-2 space-y-3 sm:col-span-1">
          <p className="font-display text-xl font-semibold text-primary">Florie</p>
          <p className="text-white/60">Mỗi bó hoa, một câu chuyện.</p>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-white/90">Danh mục</p>
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
          <p className="font-semibold text-white/90">Hỗ trợ</p>
          <ul className="space-y-2 text-white/60">
            <li>Chính sách giao hàng</li>
            <li>Chính sách đổi trả</li>
            <li>Câu hỏi thường gặp</li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-white/90">Liên hệ</p>
          <ul className="space-y-2 text-white/60">
            <li>Hà Nội, Việt Nam</li>
            <li>0900 000 000</li>
            <li>hello@florie.vn</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Florie. All rights reserved.
      </div>
    </footer>
  );
}
