import Link from "next/link";
import { getCategories } from "@/lib/api-server";
import { SearchBox } from "./search-box";

export async function Header() {
  const categories = await getCategories().catch(() => []);

  return (
    <header className="sticky top-0 z-50 border-b border-primary/60 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="font-display text-2xl font-semibold text-accent">
            Florie
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-medium text-foreground/80 sm:flex">
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category.id}
                href={`/danh-muc/${category.slug}`}
                className="transition-colors hover:text-accent"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>

        <SearchBox />
      </div>
    </header>
  );
}
