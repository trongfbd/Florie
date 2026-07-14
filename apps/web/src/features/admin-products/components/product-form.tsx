"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCategories } from "@/features/admin-categories/hooks";
import { AiGenerateButton } from "@/features/admin-ai/components/ai-generate-button";
import { useCreateProduct, useUpdateProduct } from "../hooks";
import type { ProductDetail, ProductStatus } from "../types";

const STATUS_OPTIONS: ProductStatus[] = ["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"];
const STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: "Nháp",
  ACTIVE: "Đang bán",
  OUT_OF_STOCK: "Hết hàng",
  ARCHIVED: "Ngừng kinh doanh",
};

const schema = z.object({
  name: z.string().min(2, "Vui lòng nhập tên sản phẩm"),
  slug: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  basePrice: z.coerce.number().min(0, "Giá không hợp lệ"),
  salePrice: z.coerce.number().min(0).optional().or(z.literal(NaN)),
  costPrice: z.coerce.number().min(0).optional().or(z.literal(NaN)),
  color: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"]).optional(),
});

type FormValues = z.infer<typeof schema>;

export function ProductForm({ product }: { product?: ProductDetail }) {
  const router = useRouter();
  const { data: categoriesData } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(product?.id ?? "");
  const mutation = product ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          categoryId: product.category.id,
          basePrice: product.basePrice,
          salePrice: product.salePrice ?? undefined,
          costPrice: product.costPrice ?? undefined,
          color: product.color ?? "",
          status: product.status,
        }
      : { status: "DRAFT" },
  });

  const nameValue = watch("name");

  function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      salePrice: Number.isNaN(values.salePrice) ? undefined : values.salePrice,
      costPrice: Number.isNaN(values.costPrice) ? undefined : values.costPrice,
    };
    mutation.mutate(payload, { onSuccess: () => router.push("/admin/san-pham") });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Tên sản phẩm</label>
        <input
          {...register("name")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Danh mục</label>
        <select
          {...register("categoryId")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">-- Chọn danh mục --</option>
          {categoriesData?.data.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-heading">Giá gốc (VND)</label>
          <input
            type="number"
            {...register("basePrice")}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {errors.basePrice && <p className="text-xs text-destructive">{errors.basePrice.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-heading">Giá khuyến mãi (không bắt buộc)</label>
          <input
            type="number"
            {...register("salePrice")}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Giá vốn (không bắt buộc)</label>
        <input
          type="number"
          {...register("costPrice")}
          className="w-full max-w-[calc(50%-0.5rem)] rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <p className="text-xs text-foreground/50">
          Dùng để tính lợi nhuận gộp ở Báo cáo — không hiển thị cho khách hàng.
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Màu sắc</label>
        <input
          {...register("color")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-heading">Mô tả</label>
          <AiGenerateButton
            contentType="PRODUCT_DESCRIPTION"
            topic={nameValue ?? ""}
            onGenerated={(content) => setValue("description", content)}
          />
        </div>
        <textarea
          rows={4}
          {...register("description")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Trạng thái</label>
        <select
          {...register("status")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {STATUS_LABELS[option]}
            </option>
          ))}
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

      {product && (
        <p className="text-xs text-foreground/50">
          Quản lý ảnh và công thức bó hoa (BOM) tạm thời thực hiện qua Swagger — sẽ có giao diện riêng sau.
        </p>
      )}
    </form>
  );
}
