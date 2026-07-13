import type { Metadata } from "next";
import { EditBlogContent } from "@/features/admin-blogs/components/edit-blog-content";

export const metadata: Metadata = { title: "Sửa bài viết", robots: { index: false } };

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Sửa bài viết</h1>
      <EditBlogContent id={id} />
    </div>
  );
}
