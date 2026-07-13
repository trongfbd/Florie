"use client";

import Link from "next/link";
import { getErrorMessage } from "@/lib/get-error-message";
import { useCategories, useDeleteCategory } from "../hooks";

export function CategoriesTable() {
  const { data, isLoading } = useCategories();
  const deleteMutation = useDeleteCategory();

  function handleDelete(id: string, name: string) {
    if (!confirm(`Xoá danh mục "${name}"?`)) return;
    deleteMutation.mutate(id, {
      onError: (error) => alert(getErrorMessage(error, "Không thể xoá danh mục.")),
    });
  }

  return (
    <div className="overflow-x-auto rounded-brand border-2 border-secondary bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-secondary bg-secondary/30 text-left text-xs font-semibold uppercase text-foreground/60">
          <tr>
            <th className="px-4 py-3">Tên</th>
            <th className="px-4 py-3">Slug</th>
            <th className="px-4 py-3">Sản phẩm</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary">
          {isLoading && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">
                Đang tải...
              </td>
            </tr>
          )}
          {!isLoading && data?.data.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">
                Chưa có danh mục nào.
              </td>
            </tr>
          )}
          {data?.data.map((category) => (
            <tr key={category.id} className="hover:bg-secondary/20">
              <td className="px-4 py-3 font-medium text-heading">{category.name}</td>
              <td className="px-4 py-3 text-foreground/60">{category.slug}</td>
              <td className="px-4 py-3 text-foreground/60">{category._count.products}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    category.isActive ? "bg-success/15 text-success" : "bg-secondary text-foreground/60"
                  }`}
                >
                  {category.isActive ? "Hoạt động" : "Ẩn"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-3">
                  <Link href={`/admin/danh-muc/${category.id}`} className="font-semibold text-accent hover:underline">
                    Sửa
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(category.id, category.name)}
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
