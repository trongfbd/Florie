"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { z } from "zod";
import { useProductOptions } from "@/features/admin-products/hooks";
import { useCreateCombo, useUpdateCombo } from "../hooks";
import type { Combo, ComboItemInput } from "../types";

const schema = z.object({
  name: z.string().min(2, "Vui lòng nhập tên combo"),
  slug: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  price: z.coerce.number().min(0, "Giá không hợp lệ"),
  isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ComboForm({ combo }: { combo?: Combo }) {
  const router = useRouter();
  const { data: productsData } = useProductOptions();
  const createMutation = useCreateCombo();
  const updateMutation = useUpdateCombo(combo?.id ?? "");
  const mutation = combo ? updateMutation : createMutation;

  const [items, setItems] = useState<ComboItemInput[]>(
    combo?.items.map((item) => ({ productId: item.productId, quantity: item.quantity })) ?? [],
  );
  const [itemsError, setItemsError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: combo
      ? {
          name: combo.name,
          slug: combo.slug,
          description: combo.description ?? "",
          imageUrl: combo.imageUrl ?? "",
          price: combo.price,
          isActive: combo.isActive,
        }
      : { isActive: true },
  });

  function addItem() {
    const firstProduct = productsData?.data[0];
    if (!firstProduct) return;
    setItems((prev) => [...prev, { productId: firstProduct.id, quantity: 1 }]);
  }

  function updateItem(index: number, patch: Partial<ComboItemInput>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function onSubmit(values: FormValues) {
    if (items.length === 0) {
      setItemsError("Combo cần ít nhất 1 sản phẩm.");
      return;
    }
    setItemsError(null);
    mutation.mutate({ ...values, items }, { onSuccess: () => router.push("/admin/combo") });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Tên combo</label>
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
        <label className="text-sm font-semibold text-heading">Giá bán combo (VND)</label>
        <input
          type="number"
          {...register("price")}
          className="w-48 rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
      </div>

      <div className="space-y-2 rounded-brand border-2 border-secondary bg-secondary/20 p-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-heading">Sản phẩm trong combo</label>
          <button
            type="button"
            onClick={addItem}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-accent shadow-sm hover:bg-accent hover:text-white"
          >
            + Thêm sản phẩm
          </button>
        </div>

        {items.length === 0 && <p className="text-sm text-foreground/50">Chưa có sản phẩm nào.</p>}

        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <select
              value={item.productId}
              onChange={(event) => updateItem(index, { productId: event.target.value })}
              className="flex-1 rounded-lg border-2 border-secondary bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            >
              {productsData?.data.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })}
              className="w-20 rounded-lg border-2 border-secondary bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              aria-label="Xoá"
              className="text-foreground/40 hover:text-destructive"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {itemsError && <p className="text-xs text-destructive">{itemsError}</p>}
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
