"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { z } from "zod";
import { useProductOptions } from "@/features/admin-products/hooks";
import { useCreateFlashSale, useUpdateFlashSale } from "../hooks";
import type { FlashSale, FlashSaleItemInput } from "../types";

function toDatetimeLocal(iso: string): string {
  return iso.slice(0, 16);
}

const schema = z.object({
  name: z.string().min(2, "Vui lòng nhập tên flash sale"),
  startAt: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endAt: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function FlashSaleForm({ flashSale }: { flashSale?: FlashSale }) {
  const router = useRouter();
  const { data: productsData } = useProductOptions();
  const createMutation = useCreateFlashSale();
  const updateMutation = useUpdateFlashSale(flashSale?.id ?? "");
  const mutation = flashSale ? updateMutation : createMutation;

  const [items, setItems] = useState<FlashSaleItemInput[]>(
    flashSale?.items.map((item) => ({
      productId: item.productId,
      salePrice: item.salePrice,
      quantityLimit: item.quantityLimit ?? undefined,
    })) ?? [],
  );
  const [itemsError, setItemsError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: flashSale
      ? {
          name: flashSale.name,
          startAt: toDatetimeLocal(flashSale.startAt),
          endAt: toDatetimeLocal(flashSale.endAt),
          isActive: flashSale.isActive,
        }
      : { isActive: true },
  });

  function addItem() {
    const firstProduct = productsData?.data[0];
    if (!firstProduct) return;
    setItems((prev) => [...prev, { productId: firstProduct.id, salePrice: firstProduct.basePrice }]);
  }

  function updateItem(index: number, patch: Partial<FlashSaleItemInput>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function onSubmit(values: FormValues) {
    if (items.length === 0) {
      setItemsError("Flash sale cần ít nhất 1 sản phẩm.");
      return;
    }
    setItemsError(null);
    mutation.mutate(
      {
        ...values,
        startAt: new Date(values.startAt).toISOString(),
        endAt: new Date(values.endAt).toISOString(),
        items,
      },
      { onSuccess: () => router.push("/admin/flash-sale") },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Tên flash sale</label>
        <input
          {...register("name")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-heading">Bắt đầu</label>
          <input
            type="datetime-local"
            {...register("startAt")}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {errors.startAt && <p className="text-xs text-destructive">{errors.startAt.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-heading">Kết thúc</label>
          <input
            type="datetime-local"
            {...register("endAt")}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {errors.endAt && <p className="text-xs text-destructive">{errors.endAt.message}</p>}
        </div>
      </div>

      <div className="space-y-2 rounded-brand border-2 border-secondary bg-secondary/20 p-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-heading">Sản phẩm sale</label>
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
              placeholder="Giá sale"
              value={item.salePrice}
              onChange={(event) => updateItem(index, { salePrice: Number(event.target.value) })}
              className="w-32 rounded-lg border-2 border-secondary bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <input
              type="number"
              placeholder="Giới hạn SL"
              value={item.quantityLimit ?? ""}
              onChange={(event) =>
                updateItem(index, {
                  quantityLimit: event.target.value ? Number(event.target.value) : undefined,
                })
              }
              className="w-28 rounded-lg border-2 border-secondary bg-white px-3 py-2 text-sm outline-none focus:border-accent"
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
