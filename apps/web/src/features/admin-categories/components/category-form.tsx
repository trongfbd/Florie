"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateCategory, useUpdateCategory } from "../hooks";
import type { Category } from "../types";

const schema = z.object({
  name: z.string().min(2, "Vui lòng nhập tên danh mục"),
  slug: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  displayOrder: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory(category?.id ?? "");
  const mutation = category ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: category
      ? {
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          imageUrl: category.imageUrl ?? "",
          displayOrder: category.displayOrder,
          isActive: category.isActive,
        }
      : { isActive: true },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(values, { onSuccess: () => router.push("/admin/danh-muc") });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Tên danh mục</label>
        <input
          {...register("name")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Slug (để trống sẽ tự tạo)</label>
        <input
          {...register("slug")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Mô tả</label>
        <textarea
          rows={3}
          {...register("description")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">URL ảnh</label>
        <input
          {...register("imageUrl")}
          placeholder="https://..."
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Thứ tự hiển thị</label>
        <input
          type="number"
          {...register("displayOrder")}
          className="w-32 rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-heading">
        <input type="checkbox" {...register("isActive")} className="h-4 w-4 accent-accent" />
        Đang hoạt động
      </label>

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
