"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCategories } from "@/features/admin-categories/hooks";
import { AiGenerateButton } from "@/features/admin-ai/components/ai-generate-button";
import { useCreateProduct, useUpdateProduct } from "../hooks";
import { ProductImagesManager } from "./product-images-manager";
import type { ProductDetail, ProductStatus } from "../types";

const STATUS_OPTIONS: ProductStatus[] = ["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"];
const STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: "Nháp",
  ACTIVE: "Đang bán",
  OUT_OF_STOCK: "Hết hàng",
  ARCHIVED: "Ngừng kinh doanh",
};

// z.coerce.number() alone turns a blank input ("") into 0 (Number("") === 0),
// not into "missing" — that silently saved salePrice/costPrice as 0 whenever
// the field was left empty, which made the UI treat the product as "on sale
// for 0đ" instead of falling back to basePrice. Preprocess blank strings to
// undefined first so an empty field stays genuinely optional.
const optionalPrice = z.preprocess(
  (val) => (val === "" || val === undefined ? undefined : val),
  z.coerce.number().min(0).optional(),
);

const schema = z.object({
  name: z.string().min(2, "Vui lòng nhập tên sản phẩm"),
  slug: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  basePrice: z.coerce.number().min(0, "Giá không hợp lệ"),
  salePrice: optionalPrice,
  costPrice: optionalPrice,
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
    mutation.mutate(values, {
      onSuccess: (result) => {
        // New product: land on its own edit page next (not the list) so the
        // image manager below — which needs a real product id to attach
        // uploads to — is immediately available, no separate "save first,
        // then come back" round trip.
        router.push(product ? "/admin/san-pham" : `/admin/san-pham/${result.id}`);
      },
    });
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

      {product ? (
        <ProductImagesManager productId={product.id} images={product.images} />
      ) : (
        <p className="rounded-lg bg-secondary/40 px-3 py-2 text-xs text-foreground/60">
          Bấm Lưu để tạo sản phẩm — bạn sẽ được chuyển sang đây để thêm ảnh ngay sau đó.
        </p>
      )}

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
          Công thức bó hoa (BOM) tạm thời thực hiện qua Swagger — sẽ có giao diện riêng sau.
        </p>
      )}
    </form>
  );
}
