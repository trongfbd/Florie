import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { getCategories } from "@/lib/api-server";
import { SearchBox } from "./search-box";

export async function Header() {
  const categories = await getCategories().catch(() => []);

  return (
    <header className="sticky top-0 z-50 border-b border-primary/50 bg-white/85 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-accent">
            Florie
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-foreground/80 sm:flex">
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category.id}
                href={`/danh-muc/${category.slug}`}
                className="relative py-1 transition-colors hover:text-accent after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-accent after:transition-all hover:after:w-full"
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
            className="rounded-full p-2 text-foreground/60 transition-colors hover:bg-primary hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Heart size={18} />
          </button>
          <button
            type="button"
            disabled
            title="Sẽ có ở bước tiếp theo"
            aria-label="Giỏ hàng"
            className="rounded-full p-2 text-foreground/60 transition-colors hover:bg-primary hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
