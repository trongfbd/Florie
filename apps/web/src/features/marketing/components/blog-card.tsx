import Image from "next/image";
import Link from "next/link";
import type { Blog } from "../types";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group block overflow-hidden rounded-brand border-2 border-secondary bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary hover:shadow-xl hover:shadow-accent/10"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        {blog.thumbnailUrl ? (
          <Image
            src={blog.thumbnailUrl}
            alt={blog.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-foreground/40">Bèo Flower Corner</div>
        )}
      </div>
      <div className="space-y-1.5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">{formatDate(blog.publishedAt)}</p>
        <h3 className="line-clamp-2 font-display text-lg font-semibold text-heading">{blog.title}</h3>
        <p className="text-sm text-foreground/60">Bèo Flower Corner · {blog.author.name}</p>
      </div>
    </Link>
  );
}
