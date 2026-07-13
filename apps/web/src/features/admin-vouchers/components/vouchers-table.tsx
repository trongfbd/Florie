"use client";

import Link from "next/link";
import { useState } from "react";
import { formatVnd } from "@/lib/format";
import { getErrorMessage } from "@/lib/get-error-message";
import { useDeleteVoucher, useVouchers } from "../hooks";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function VouchersTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useVouchers({ page });
  const deleteMutation = useDeleteVoucher();

  function handleDelete(id: string, code: string) {
    if (!confirm(`Xoá voucher "${code}"?`)) return;
    deleteMutation.mutate(id, { onError: (error) => alert(getErrorMessage(error, "Không thể xoá voucher.")) });
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-brand border-2 border-secondary bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-secondary bg-secondary/30 text-left text-xs font-semibold uppercase text-foreground/60">
            <tr>
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Giảm giá</th>
              <th className="px-4 py-3">Hiệu lực</th>
              <th className="px-4 py-3">Đã dùng</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-foreground/50">Đang tải...</td>
              </tr>
            )}
            {!isLoading && data?.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-foreground/50">Chưa có voucher nào.</td>
              </tr>
            )}
            {data?.data.map((voucher) => (
              <tr key={voucher.id} className="hover:bg-secondary/20">
                <td className="px-4 py-3 font-mono font-semibold text-heading">{voucher.code}</td>
                <td className="px-4 py-3 text-foreground/70">
                  {voucher.discountType === "PERCENTAGE" ? `${voucher.discountValue}%` : formatVnd(voucher.discountValue)}
                </td>
                <td className="px-4 py-3 text-foreground/60">
                  {formatDate(voucher.startAt)} - {formatDate(voucher.endAt)}
                </td>
                <td className="px-4 py-3 text-foreground/60">
                  {voucher.usedCount}
                  {voucher.usageLimit ? `/${voucher.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      voucher.isActive ? "bg-success/15 text-success" : "bg-secondary text-foreground/60"
                    }`}
                  >
                    {voucher.isActive ? "Hoạt động" : "Tắt"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/voucher/${voucher.id}`} className="font-semibold text-accent hover:underline">
                      Sửa
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(voucher.id, voucher.code)}
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
