"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { getErrorMessage } from "@/lib/get-error-message";
import { MATERIAL_TYPE_LABELS } from "@/lib/material-type-labels";
import { useDeleteMaterial, useMaterials } from "../hooks";

function isLowStock(material: { stockQuantity: string; minStockThreshold: string }): boolean {
  return Number(material.stockQuantity) <= Number(material.minStockThreshold);
}

export function MaterialsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const { data, isLoading } = useMaterials({ page, search: search || undefined, lowStock: lowStockOnly || undefined });
  const deleteMutation = useDeleteMaterial();

  function handleDelete(id: string, name: string) {
    if (!confirm(`Xoá vật tư "${name}"?`)) return;
    deleteMutation.mutate(id, {
      onError: (error) => alert(getErrorMessage(error, "Không thể xoá vật tư.")),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSearch(searchInput);
          }}
        >
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tìm theo tên..."
            className="w-64 rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            Tìm
          </button>
        </form>

        <label className="flex items-center gap-2 rounded-lg border-2 border-secondary px-3 py-2 text-sm font-semibold text-heading">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(event) => {
              setPage(1);
              setLowStockOnly(event.target.checked);
            }}
            className="h-4 w-4 accent-destructive"
          />
          Chỉ hiện sắp hết hàng
        </label>
      </div>

      <div className="overflow-x-auto rounded-brand border-2 border-secondary bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-secondary bg-secondary/30 text-left text-xs font-semibold uppercase text-foreground/60">
            <tr>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3">Tồn kho</th>
              <th className="px-4 py-3">Nhà cung cấp</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-foreground/50">
                  Đang tải...
                </td>
              </tr>
            )}
            {!isLoading && data?.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-foreground/50">
                  Không tìm thấy vật tư nào.
                </td>
              </tr>
            )}
            {data?.data.map((material) => {
              const lowStock = isLowStock(material);
              return (
                <tr key={material.id} className="hover:bg-secondary/20">
                  <td className="px-4 py-3 font-medium text-heading">{material.name}</td>
                  <td className="px-4 py-3 text-foreground/60">{MATERIAL_TYPE_LABELS[material.type]}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 font-medium ${lowStock ? "text-destructive" : "text-heading"}`}>
                      {lowStock && <AlertTriangle size={14} />}
                      {material.stockQuantity} {material.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground/60">{material.supplier?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        material.isActive ? "bg-success/15 text-success" : "bg-secondary text-foreground/60"
                      }`}
                    >
                      {material.isActive ? "Hoạt động" : "Ẩn"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/vat-tu/${material.id}`}
                        className="font-semibold text-accent hover:underline"
                      >
                        Sửa
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(material.id, material.name)}
                        className="font-semibold text-destructive hover:underline"
                      >
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
