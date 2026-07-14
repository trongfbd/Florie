"use client";

import Link from "next/link";
import { useState } from "react";
import { getErrorMessage } from "@/lib/get-error-message";
import { useDeleteSupplier, useSuppliers } from "../hooks";

export function SuppliersTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const { data, isLoading } = useSuppliers({ page, search: search || undefined });
  const deleteMutation = useDeleteSupplier();

  function handleDelete(id: string, name: string) {
    if (!confirm(`Xoá nhà cung cấp "${name}"?`)) return;
    deleteMutation.mutate(id, {
      onError: (error) => alert(getErrorMessage(error, "Không thể xoá nhà cung cấp.")),
    });
  }

  return (
    <div className="space-y-4">
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

      <div className="overflow-x-auto rounded-brand border-2 border-secondary bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-secondary bg-secondary/30 text-left text-xs font-semibold uppercase text-foreground/60">
            <tr>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">SĐT</th>
              <th className="px-4 py-3">Email</th>
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
                  Chưa có nhà cung cấp nào.
                </td>
              </tr>
            )}
            {data?.data.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-secondary/20">
                <td className="px-4 py-3 font-medium text-heading">{supplier.name}</td>
                <td className="px-4 py-3 text-foreground/60">{supplier.phone ?? "—"}</td>
                <td className="px-4 py-3 text-foreground/60">{supplier.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      supplier.isActive ? "bg-success/15 text-success" : "bg-secondary text-foreground/60"
                    }`}
                  >
                    {supplier.isActive ? "Hoạt động" : "Ẩn"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/nha-cung-cap/${supplier.id}`}
                      className="font-semibold text-accent hover:underline"
                    >
                      Sửa
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(supplier.id, supplier.name)}
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
