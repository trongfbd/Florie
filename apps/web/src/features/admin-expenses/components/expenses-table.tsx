"use client";

import Link from "next/link";
import { useState } from "react";
import { formatVnd } from "@/lib/format";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/expense-category-labels";
import { getErrorMessage } from "@/lib/get-error-message";
import { useDeleteExpense, useExpenses } from "../hooks";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function ExpensesTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useExpenses({ page });
  const deleteMutation = useDeleteExpense();

  function handleDelete(id: string) {
    if (!confirm("Xoá khoản chi này?")) return;
    deleteMutation.mutate(id, { onError: (error) => alert(getErrorMessage(error, "Không thể xoá khoản chi.")) });
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-brand border-2 border-secondary bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-secondary bg-secondary/30 text-left text-xs font-semibold uppercase text-foreground/60">
            <tr>
              <th className="px-4 py-3">Ngày</th>
              <th className="px-4 py-3">Hạng mục</th>
              <th className="px-4 py-3">Mô tả</th>
              <th className="px-4 py-3 text-right">Số tiền</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">Đang tải...</td>
              </tr>
            )}
            {!isLoading && data?.data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">Chưa có khoản chi nào.</td>
              </tr>
            )}
            {data?.data.map((expense) => (
              <tr key={expense.id} className="hover:bg-secondary/20">
                <td className="px-4 py-3 text-foreground/60">{formatDate(expense.expenseDate)}</td>
                <td className="px-4 py-3 font-medium text-heading">
                  {EXPENSE_CATEGORY_LABELS[expense.category] ?? expense.category}
                </td>
                <td className="px-4 py-3 text-foreground/60">{expense.description ?? "—"}</td>
                <td className="px-4 py-3 text-right font-semibold text-heading">{formatVnd(expense.amount)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/chi-phi/${expense.id}`} className="font-semibold text-accent hover:underline">
                      Sửa
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(expense.id)}
                      className="font-semibold text-destructive hover:underline"
                    >
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-full border border-primary px-3 py-1.5 text-sm disabled:pointer-events-none disabled:text-foreground/30"
          >
            Trước
          </button>
          <span className="text-sm text-foreground/60">
            Trang {data.meta.page}/{data.meta.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-primary px-3 py-1.5 text-sm disabled:pointer-events-none disabled:text-foreground/30"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
