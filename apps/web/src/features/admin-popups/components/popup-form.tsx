"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreatePopup, useUpdatePopup } from "../hooks";
import type { Popup } from "../types";

const schema = z.object({
  title: z.string().min(2, "Vui lòng nhập tiêu đề"),
  imageUrl: z.string().optional(),
  content: z.string().optional(),
  linkUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function PopupForm({ popup }: { popup?: Popup }) {
  const router = useRouter();
  const createMutation = useCreatePopup();
  const updateMutation = useUpdatePopup(popup?.id ?? "");
  const mutation = popup ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: popup
      ? {
          title: popup.title,
          imageUrl: popup.imageUrl ?? "",
          content: popup.content ?? "",
          linkUrl: popup.linkUrl ?? "",
          isActive: popup.isActive,
        }
      : { isActive: true },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(values, { onSuccess: () => router.push("/admin/popup") });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Tiêu đề</label>
        <input
          {...register("title")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">URL ảnh (không bắt buộc)</label>
        <input
          {...register("imageUrl")}
          placeholder="https://..."
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Nội dung</label>
        <textarea
          rows={3}
          {...register("content")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Link khi bấm &ldquo;Xem ngay&rdquo; (không bắt buộc)</label>
        <input
          {...register("linkUrl")}
          placeholder="/flash-sale"
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
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
