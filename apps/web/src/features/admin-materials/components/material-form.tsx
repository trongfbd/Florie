"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSupplierOptions } from "@/features/admin-suppliers/hooks";
import { MATERIAL_TYPE_LABELS, MATERIAL_TYPE_OPTIONS } from "@/lib/material-type-labels";
import { useCreateMaterial, useUpdateMaterial } from "../hooks";
import type { Material } from "../types";

const schema = z.object({
  name: z.string().min(2, "Vui lòng nhập tên vật tư"),
  type: z.enum([
    "FLOWER",
    "PAPER",
    "RIBBON",
    "FOAM",
    "BASKET",
    "ARRANGEMENT_BOX",
    "CARD",
    "CHOCOLATE",
    "TEDDY_BEAR",
    "SCENTED_CANDLE",
    "OTHER",
  ]),
  unit: z.string().min(1, "Vui lòng nhập đơn vị tính"),
  minStockThreshold: z.coerce.number().min(0).optional(),
  supplierId: z.string().optional(),
  isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function MaterialForm({ material }: { material?: Material }) {
  const router = useRouter();
  const { data: suppliersData } = useSupplierOptions();
  const createMutation = useCreateMaterial();
  const updateMutation = useUpdateMaterial(material?.id ?? "");
  const mutation = material ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: material
      ? {
          name: material.name,
          type: material.type,
          unit: material.unit,
          minStockThreshold: Number(material.minStockThreshold),
          supplierId: material.supplierId ?? "",
          isActive: material.isActive,
        }
      : { type: "FLOWER", isActive: true },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(
      { ...values, supplierId: values.supplierId || undefined },
      { onSuccess: () => router.push("/admin/vat-tu") },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Tên vật tư</label>
        <input
          {...register("name")}
          placeholder="VD: Hoa hồng đỏ Ecuador"
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-heading">Loại</label>
          <select
            {...register("type")}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          >
            {MATERIAL_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {MATERIAL_TYPE_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-heading">Đơn vị tính</label>
          <input
            {...register("unit")}
            placeholder="bó, cuộn, cái, mét..."
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {errors.unit && <p className="text-xs text-destructive">{errors.unit.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Nhà cung cấp</label>
        <select
          {...register("supplierId")}
          className="w-full rounded-lg border-2 border-secondary bg-white px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">-- Chưa chọn --</option>
          {suppliersData?.data.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Ngưỡng cảnh báo sắp hết</label>
        <input
          type="number"
          step="0.01"
          {...register("minStockThreshold")}
          className="w-48 rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <p className="text-xs text-foreground/50">
          Khi tồn kho bằng hoặc thấp hơn số này, hệ thống sẽ báo &quot;sắp hết hàng&quot;.
        </p>
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

      {!material && (
        <p className="rounded-lg bg-secondary/40 px-3 py-2 text-xs text-foreground/60">
          Lưu vật tư trước, sau đó quay lại đây để nhập kho lần đầu.
        </p>
      )}
    </form>
  );
}
