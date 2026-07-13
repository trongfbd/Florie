import type { Metadata } from "next";
import Link from "next/link";
import { BlogsTable } from "@/features/admin-blogs/components/blogs-table";

export const metadata: Metadata = { title: "Blog", robots: { index: false } };

export default function AdminBlogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-heading">Blog</h1>
        <Link
          href="/admin/blog/moi"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105"
        >
          + Viết bài mới
        </Link>
      </div>
      <BlogsTable />
    </div>
  );
}
