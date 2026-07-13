import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { getCategories } from "@/lib/api-server";
import { SearchBox } from "./search-box";
import { Container } from "./container";

export async function Header() {
  const categories = await getCategories().catch(() => []);

  return (
    <header className="sticky top-0 z-50 border-b border-primary bg-white/95 shadow-sm backdrop-blur-md">
      <Container className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-8">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight text-accent">
            Florie
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-heading/80 sm:flex">
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category.id}
                href={`/danh-muc/${category.slug}`}
                className="relative py-1 transition-colors hover:text-accent after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <SearchBox />
          <button
            type="button"
            disabled
            title="Sẽ có ở bước tiếp theo"
            aria-label="Yêu thích"
            className="rounded-full p-2.5 text-heading/60 transition-colors hover:bg-primary hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Heart size={18} />
          </button>
          <button
            type="button"
            disabled
            title="Sẽ có ở bước tiếp theo"
            aria-label="Giỏ hàng"
            className="rounded-full p-2.5 text-heading/60 transition-colors hover:bg-primary hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </Container>
    </header>
  );
}
