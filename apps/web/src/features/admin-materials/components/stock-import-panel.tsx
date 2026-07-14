"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSupplierOptions } from "@/features/admin-suppliers/hooks";
import { useImportMaterialStock } from "../hooks";
import type { Material } from "../types";

const schema = z.object({
  quantity: z.coerce.number().positive("Số lượng phải lớn hơn 0"),
  unitCost: z.coerce.number().positive("Đơn giá phải lớn hơn 0"),
  supplierId: z.string().optional(),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function StockImportPanel({ material }: { material: Material }) {
  const { data: suppliersData } = useSupplierOptions();
  const mutation = useImportMaterialStock(material.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { supplierId: material.supplierId ?? "" },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(
      { ...values, supplierId: values.supplierId || undefined },
      { onSuccess: () => reset({ quantity: undefined, unitCost: undefined, supplierId: material.supplierId ?? "", note: "" }) },
    );
  }

  return (
    <div className="space-y-4 rounded-brand border-2 border-secondary bg-secondary/20 p-5">
      <div>
        <h2 className="font-display text-lg font-bold text-heading">Nhập kho</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Tồn kho hiện tại: <span className="font-semibold text-heading">{material.stockQuantity} {material.unit}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-heading">Số lượng nhập</label>
            <input
              type="number"
              step="0.01"
              {...register("quantity")}
              className="w-full rounded-lg border-2 border-secondary bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
            {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-heading">Đơn giá (VND)</label>
            <input
              type="number"
              {...register("unitCost")}
              className="w-full rounded-lg border-2 border-secondary bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
            {errors.unitCost && <p className="text-xs text-destructive">{errors.unitCost.message}</p>}
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
          <label className="text-sm font-semibold text-heading">Ghi chú</label>
          <input
            {...register("note")}
            placeholder="VD: Nhập từ chợ hoa Quảng An sáng nay"
            className="w-full rounded-lg border-2 border-secondary bg-white px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        {mutation.isError && <p className="text-sm text-destructive">Nhập kho thất bại — vui lòng thử lại.</p>}
        {mutation.isSuccess && <p className="text-sm text-success">✓ Đã nhập kho thành công.</p>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-full bg-heading px-5 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 disabled:opacity-60"
        >
          {mutation.isPending ? "Đang lưu..." : "Xác nhận nhập kho"}
        </button>
      </form>
    </div>
  );
}
