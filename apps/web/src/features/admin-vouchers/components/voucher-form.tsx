"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateVoucher, useUpdateVoucher } from "../hooks";
import type { Voucher } from "../types";

function toDatetimeLocal(iso: string): string {
  return iso.slice(0, 16);
}

const schema = z.object({
  code: z.string().min(3, "Mã tối thiểu 3 ký tự"),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.coerce.number().min(1, "Giá trị không hợp lệ"),
  minOrderValue: z.coerce.number().optional(),
  maxDiscountAmount: z.coerce.number().optional(),
  usageLimit: z.coerce.number().optional(),
  startAt: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endAt: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function VoucherForm({ voucher }: { voucher?: Voucher }) {
  const router = useRouter();
  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher(voucher?.id ?? "");
  const mutation = voucher ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: voucher
      ? {
          code: voucher.code,
          description: voucher.description ?? "",
          discountType: voucher.discountType,
          discountValue: voucher.discountValue,
          minOrderValue: voucher.minOrderValue,
          maxDiscountAmount: voucher.maxDiscountAmount ?? undefined,
          usageLimit: voucher.usageLimit ?? undefined,
          startAt: toDatetimeLocal(voucher.startAt),
          endAt: toDatetimeLocal(voucher.endAt),
          isActive: voucher.isActive,
        }
      : { discountType: "PERCENTAGE", isActive: true },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(
      { ...values, startAt: new Date(values.startAt).toISOString(), endAt: new Date(values.endAt).toISOString() },
      { onSuccess: () => router.push("/admin/voucher") },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Mã voucher</label>
        <input
          {...register("code")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm uppercase outline-none focus:border-accent"
        />
        {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Mô tả</label>
        <input
          {...register("description")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-heading">Loại giảm giá</label>
          <select
            {...register("discountType")}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="PERCENTAGE">Phần trăm (%)</option>
            <option value="FIXED_AMOUNT">Số tiền cố định (VND)</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-heading">Giá trị</label>
          <input
            type="number"
            {...register("discountValue")}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {errors.discountValue && <p className="text-xs text-destructive">{errors.discountValue.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-heading">Đơn tối thiểu (VND)</label>
          <input
            type="number"
            {...register("minOrderValue")}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-heading">Giảm tối đa (VND, chỉ áp dụng %)</label>
          <input
            type="number"
            {...register("maxDiscountAmount")}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Giới hạn lượt dùng (để trống là không giới hạn)</label>
        <input
          type="number"
          {...register("usageLimit")}
          className="w-32 rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
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
