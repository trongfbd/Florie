"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { useCreateBanner, useUpdateBanner } from "../hooks";
import type { Banner, BannerPosition } from "../types";

const POSITION_OPTIONS: BannerPosition[] = ["HOME", "CATEGORY", "PRODUCT", "CHECKOUT"];
const POSITION_LABELS: Record<BannerPosition, string> = {
  HOME: "Trang chủ",
  CATEGORY: "Danh mục",
  PRODUCT: "Sản phẩm",
  CHECKOUT: "Thanh toán",
};

const schema = z.object({
  title: z.string().min(2, "Vui lòng nhập tiêu đề"),
  imageUrl: z.string().min(1, "Vui lòng nhập URL ảnh"),
  linkUrl: z.string().optional(),
  position: z.enum(["HOME", "CATEGORY", "PRODUCT", "CHECKOUT"]).optional(),
  displayOrder: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function BannerForm({ banner }: { banner?: Banner }) {
  const router = useRouter();
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner(banner?.id ?? "");
  const mutation = banner ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: banner
      ? {
          title: banner.title,
          imageUrl: banner.imageUrl,
          linkUrl: banner.linkUrl ?? "",
          position: banner.position,
          displayOrder: banner.displayOrder,
          isActive: banner.isActive,
        }
      : { position: "HOME", isActive: true },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(values, { onSuccess: () => router.push("/admin/banner") });
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
        <ImageUploadField
          label="Ảnh banner"
          value={watch("imageUrl") ?? ""}
          onChange={(url) => setValue("imageUrl", url, { shouldValidate: true })}
          folder="banners"
        />
        {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Link khi bấm vào (không bắt buộc)</label>
        <input
          {...register("linkUrl")}
          placeholder="/flash-sale"
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-heading">Vị trí</label>
          <select
            {...register("position")}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          >
            {POSITION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {POSITION_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-heading">Thứ tự hiển thị</label>
          <input
            type="number"
            {...register("displayOrder")}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
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
