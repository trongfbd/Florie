"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AiGenerateButton } from "@/features/admin-ai/components/ai-generate-button";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { useCreateBlog, useUpdateBlog } from "../hooks";
import type { Blog } from "../types";

const schema = z.object({
  title: z.string().min(2, "Vui lòng nhập tiêu đề"),
  slug: z.string().optional(),
  content: z.string().min(10, "Nội dung tối thiểu 10 ký tự"),
  thumbnailUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

type FormValues = z.infer<typeof schema>;

export function BlogForm({ blog }: { blog?: Blog }) {
  const router = useRouter();
  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog(blog?.id ?? "");
  const mutation = blog ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: blog
      ? {
          title: blog.title,
          slug: blog.slug,
          content: blog.content,
          thumbnailUrl: blog.thumbnailUrl ?? "",
          seoTitle: blog.seoTitle ?? "",
          seoDescription: blog.seoDescription ?? "",
          status: blog.status,
        }
      : { status: "DRAFT" },
  });

  const titleValue = watch("title");

  function onSubmit(values: FormValues) {
    mutation.mutate(values, { onSuccess: () => router.push("/admin/blog") });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Tiêu đề</label>
        <input
          {...register("title")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Slug (để trống sẽ tự tạo)</label>
        <input
          {...register("slug")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <ImageUploadField
        label="Ảnh đại diện"
        value={watch("thumbnailUrl") ?? ""}
        onChange={(url) => setValue("thumbnailUrl", url)}
        folder="blog"
      />

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-heading">Nội dung (Markdown)</label>
          <AiGenerateButton
            contentType="BLOG_POST"
            topic={titleValue ?? ""}
            onGenerated={(content) => setValue("content", content)}
          />
        </div>
        <textarea
          rows={14}
          {...register("content")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 font-mono text-sm outline-none focus:border-accent"
        />
        {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">SEO Title</label>
        <input
          {...register("seoTitle")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">SEO Description</label>
        <textarea
          rows={2}
          {...register("seoDescription")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Trạng thái</label>
        <select
          {...register("status")}
          className="w-48 rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="DRAFT">Nháp</option>
          <option value="PUBLISHED">Đăng ngay</option>
        </select>
      </div>

      {mutation.isError && (
        <p className="text-sm text-destructive">Có lỗi xảy ra — vui lòng kiểm tra lại thông tin.</p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105 disabled:opacity-60"
      >
        {mutation.isPending ? "Đang lưu..." : "Lưu"}
      </button>
    </form>
  );
}
