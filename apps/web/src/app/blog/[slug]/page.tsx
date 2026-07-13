import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBlogBySlug } from "@/lib/api-server";
import { MarkdownContent } from "@/features/marketing/components/markdown-content";
import { Container } from "@/components/layout/container";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {};
  }

  return {
    title: blog.seoTitle ?? blog.title,
    description: blog.seoDescription ?? undefined,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  return (
    <Container className="max-w-3xl space-y-6 py-12">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">
          {formatDate(blog.publishedAt)} · {blog.author.name}
        </p>
        <h1 className="font-display text-4xl font-bold text-heading">{blog.title}</h1>
      </div>

      {blog.thumbnailUrl && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-brand border-2 border-secondary bg-secondary">
          <Image src={blog.thumbnailUrl} alt={blog.title} fill sizes="768px" className="object-cover" />
        </div>
      )}

      <MarkdownContent content={blog.content} />
    </Container>
  );
}
