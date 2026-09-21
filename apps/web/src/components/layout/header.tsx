import Link from "next/link";
import { getCategories } from "@/lib/api-server";
import { SearchBox } from "./search-box";
import { Container } from "./container";
import { HeaderActions } from "./header-actions";
import { MobileNav } from "./mobile-nav";

const MAX_NAV_CATEGORIES = 9;

const STATIC_NAV_LINKS = [
  { href: "/combo", label: "Combo" },
  { href: "/flash-sale", label: "Flash Sale" },
  { href: "/blog", label: "Blog" },
  { href: "/#lien-he", label: "Liên hệ" },
];

export async function Header() {
  const categories = await getCategories().catch(() => []);
  const categoryLinks = categories
    .slice(0, MAX_NAV_CATEGORIES)
    .map((category) => ({ href: `/danh-muc/${category.slug}`, label: category.name }));

  return (
    <header className="sticky top-0 z-50 border-b border-primary bg-white/95 shadow-sm backdrop-blur-md">
      <Container className="flex items-center gap-4 py-3">
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap font-display text-xl font-bold tracking-tight text-accent sm:text-2xl"
        >
          Bèo Flower Corner
        </Link>

        {/* Single row, never wraps: items are shrink-0 and the row scrolls
            horizontally in the rare case 9 long category names + the static
            links genuinely don't fit a given desktop width, instead of
            breaking onto a second line. justify-evenly spreads them across
            whatever space is left once it does fit (the common case). */}
        <nav className="hidden min-w-0 flex-1 items-center justify-evenly gap-5 overflow-x-auto whitespace-nowrap text-sm font-semibold text-heading/80 [scrollbar-width:none] lg:flex [&::-webkit-scrollbar]:hidden">
          {categoryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative shrink-0 py-1 transition-colors hover:text-accent after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
          {STATIC_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                link.label === "Flash Sale"
                  ? "relative shrink-0 py-1 font-bold text-accent after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
                  : "relative shrink-0 py-1 transition-colors hover:text-accent after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <div className="hidden lg:block">
            <SearchBox />
          </div>
          <HeaderActions />
          <MobileNav categoryLinks={categoryLinks} staticLinks={STATIC_NAV_LINKS} />
        </div>
      </Container>
    </header>
  );
}
