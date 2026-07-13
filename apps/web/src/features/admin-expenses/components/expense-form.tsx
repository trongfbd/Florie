"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from "@/lib/expense-category-labels";
import { useCreateExpense, useUpdateExpense } from "../hooks";
import type { Expense } from "../types";

const schema = z.object({
  category: z.string().min(1, "Vui lòng chọn hạng mục"),
  description: z.string().optional(),
  amount: z.coerce.number().min(1, "Số tiền không hợp lệ"),
  expenseDate: z.string().optional(),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ExpenseForm({ expense }: { expense?: Expense }) {
  const router = useRouter();
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense(expense?.id ?? "");
  const mutation = expense ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: expense
      ? {
          category: expense.category,
          description: expense.description ?? "",
          amount: expense.amount,
          expenseDate: expense.expenseDate.slice(0, 10),
          note: expense.note ?? "",
        }
      : { category: EXPENSE_CATEGORIES[0] },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(
      { ...values, expenseDate: values.expenseDate ? new Date(values.expenseDate).toISOString() : undefined },
      { onSuccess: () => router.push("/admin/chi-phi") },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Hạng mục</label>
        <select
          {...register("category")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        >
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {EXPENSE_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
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
          <label className="text-sm font-semibold text-heading">Số tiền (VND)</label>
          <input
            type="number"
            {...register("amount")}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-heading">Ngày chi (để trống là hôm nay)</label>
          <input
            type="date"
            {...register("expenseDate")}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-heading">Ghi chú</label>
        <textarea
          rows={2}
          {...register("note")}
          className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
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
    </form>
  );
}
