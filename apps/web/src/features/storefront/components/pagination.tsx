import Link from "next/link";

interface PaginationProps {
  basePath: string;
  searchParams: Record<string, string | undefined>;
  page: number;
  totalPages: number;
}

function buildHref(basePath: string, searchParams: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "page") params.set(key, value);
  });
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({ basePath, searchParams, page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Phân trang">
      <Link
        href={buildHref(basePath, searchParams, Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`rounded-full border border-primary px-3 py-1.5 text-sm transition-colors ${
          page === 1
            ? "pointer-events-none text-foreground/30"
            : "hover:bg-primary hover:text-foreground"
        }`}
      >
        Trước
      </Link>

      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(basePath, searchParams, p)}
          className={`h-9 w-9 rounded-full text-center text-sm leading-9 transition-colors ${
            p === page
              ? "bg-accent font-semibold text-white"
              : "border border-primary hover:bg-primary"
          }`}
        >
          {p}
        </Link>
      ))}

      <Link
        href={buildHref(basePath, searchParams, Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`rounded-full border border-primary px-3 py-1.5 text-sm transition-colors ${
          page === totalPages
            ? "pointer-events-none text-foreground/30"
            : "hover:bg-primary hover:text-foreground"
        }`}
      >
        Sau
      </Link>
    </nav>
  );
}
