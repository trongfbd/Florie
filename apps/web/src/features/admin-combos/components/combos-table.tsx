"use client";

import Link from "next/link";
import { useState } from "react";
import { formatVnd } from "@/lib/format";
import { getErrorMessage } from "@/lib/get-error-message";
import { useCombos, useDeleteCombo } from "../hooks";

export function CombosTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCombos({ page });
  const deleteMutation = useDeleteCombo();

  function handleDelete(id: string, name: string) {
    if (!confirm(`Xoá combo "${name}"?`)) return;
    deleteMutation.mutate(id, { onError: (error) => alert(getErrorMessage(error, "Không thể xoá combo.")) });
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-brand border-2 border-secondary bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-secondary bg-secondary/30 text-left text-xs font-semibold uppercase text-foreground/60">
            <tr>
              <th className="px-4 py-3">Tên combo</th>
              <th className="px-4 py-3">Số sản phẩm</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Trạng thái</th>
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
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">Chưa có combo nào.</td>
              </tr>
            )}
            {data?.data.map((combo) => (
              <tr key={combo.id} className="hover:bg-secondary/20">
                <td className="px-4 py-3 font-semibold text-heading">{combo.name}</td>
                <td className="px-4 py-3 text-foreground/60">{combo.items.length}</td>
                <td className="px-4 py-3 font-semibold text-heading">{formatVnd(combo.price)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      combo.isActive ? "bg-success/15 text-success" : "bg-secondary text-foreground/60"
                    }`}
                  >
                    {combo.isActive ? "Hoạt động" : "Tắt"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/combo/${combo.id}`} className="font-semibold text-accent hover:underline">
                      Sửa
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(combo.id, combo.name)}
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
