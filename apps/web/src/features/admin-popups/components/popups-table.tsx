"use client";

import Link from "next/link";
import { getErrorMessage } from "@/lib/get-error-message";
import { useDeletePopup, usePopups } from "../hooks";

export function PopupsTable() {
  const { data, isLoading } = usePopups();
  const deleteMutation = useDeletePopup();

  function handleDelete(id: string, title: string) {
    if (!confirm(`Xoá popup "${title}"?`)) return;
    deleteMutation.mutate(id, { onError: (error) => alert(getErrorMessage(error, "Không thể xoá popup.")) });
  }

  return (
    <div className="overflow-x-auto rounded-brand border-2 border-secondary bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-secondary bg-secondary/30 text-left text-xs font-semibold uppercase text-foreground/60">
          <tr>
            <th className="px-4 py-3">Tiêu đề</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary">
          {isLoading && (
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-foreground/50">Đang tải...</td>
            </tr>
          )}
          {!isLoading && data?.data.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-foreground/50">Chưa có popup nào.</td>
            </tr>
          )}
          {data?.data.map((popup) => (
            <tr key={popup.id} className="hover:bg-secondary/20">
              <td className="px-4 py-3 font-medium text-heading">{popup.title}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    popup.isActive ? "bg-success/15 text-success" : "bg-secondary text-foreground/60"
                  }`}
                >
                  {popup.isActive ? "Hoạt động" : "Tắt"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-3">
                  <Link href={`/admin/popup/${popup.id}`} className="font-semibold text-accent hover:underline">
                    Sửa
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(popup.id, popup.title)}
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
  );
}
