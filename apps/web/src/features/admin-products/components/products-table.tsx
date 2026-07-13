"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatVnd } from "@/lib/format";
import { getErrorMessage } from "@/lib/get-error-message";
import { useDeleteProduct, useProducts } from "../hooks";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Nháp",
  ACTIVE: "Đang bán",
  OUT_OF_STOCK: "Hết hàng",
  ARCHIVED: "Ngừng kinh doanh",
};

const STATUS_TONE: Record<string, string> = {
  DRAFT: "bg-secondary text-foreground/60",
  ACTIVE: "bg-success/15 text-success",
  OUT_OF_STOCK: "bg-accent/15 text-accent",
  ARCHIVED: "bg-destructive/10 text-destructive",
};

export function ProductsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useProducts({ page, search: search || undefined });
  const deleteMutation = useDeleteProduct();

  function handleDelete(id: string, name: string) {
    if (!confirm(`Xoá sản phẩm "${name}"?`)) return;
    deleteMutation.mutate(id, {
      onError: (error) => alert(getErrorMessage(error, "Không thể xoá sản phẩm.")),
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
          placeholder="Tìm theo tên sản phẩm..."
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
              <th className="px-4 py-3">Sản phẩm</th>
              <th className="px-4 py-3">Danh mục</th>
              <th className="px-4 py-3">Giá</th>
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
                  Không tìm thấy sản phẩm nào.
                </td>
              </tr>
            )}
            {data?.data.map((product) => (
              <tr key={product.id} className="hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {product.images[0] && (
                        <Image src={product.images[0].url} alt="" fill className="object-cover" />
                      )}
                    </div>
                    <Link href={`/admin/san-pham/${product.id}`} className="font-semibold text-accent hover:underline">
                      {product.name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground/60">{product.category.name}</td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-heading">
                    {formatVnd(product.salePrice ?? product.basePrice)}
                  </span>
                  {product.salePrice && (
                    <span className="ml-2 text-xs text-foreground/40 line-through">
                      {formatVnd(product.basePrice)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONE[product.status]}`}>
                    {STATUS_LABELS[product.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/san-pham/${product.id}`} className="font-semibold text-accent hover:underline">
                      Sửa
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id, product.name)}
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
