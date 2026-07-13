import type { Metadata } from "next";
import { getBlogs } from "@/lib/api-server";
import { BlogCard } from "@/features/marketing/components/blog-card";
import { Pagination } from "@/features/storefront/components/pagination";
import { FadeIn } from "@/components/motion/fade-in";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Blog",
  description: "Mẹo cắm hoa, bảo quản hoa tươi và câu chuyện từ Florie.",
};

interface BlogListPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function BlogListPage({ searchParams }: BlogListPageProps) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const result = await getBlogs({ page, search: sp.search });

  return (
    <Container className="space-y-8 py-12">
      <FadeIn className="text-center">
        <h1 className="font-display text-4xl font-bold text-heading">Blog Florie</h1>
        <p className="mt-2 text-foreground/70">Mẹo cắm hoa, bảo quản hoa tươi và câu chuyện từ Florie</p>
      </FadeIn>

      {result.data.length === 0 ? (
        <div className="rounded-brand border border-dashed border-primary bg-secondary/40 p-12 text-center text-foreground/60">
          Chưa có bài viết nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}

      <Pagination basePath="/blog" searchParams={sp} page={result.meta.page} totalPages={result.meta.totalPages} />
    </Container>
  );
}
