"use client";

import { useBlog } from "../hooks";
import { BlogForm } from "./blog-form";

export function EditBlogContent({ id }: { id: string }) {
  const { data: blog, isLoading } = useBlog(id);

  if (isLoading || !blog) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  return <BlogForm blog={blog} />;
}
