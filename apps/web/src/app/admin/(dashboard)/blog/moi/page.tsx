import type { Metadata } from "next";
import { BlogForm } from "@/features/admin-blogs/components/blog-form";

export const metadata: Metadata = { title: "Viết bài mới", robots: { index: false } };

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Viết bài mới</h1>
      <BlogForm />
    </div>
  );
}
