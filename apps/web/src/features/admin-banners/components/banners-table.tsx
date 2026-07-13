"use client";

import Image from "next/image";
import Link from "next/link";
import { getErrorMessage } from "@/lib/get-error-message";
import { useBanners, useDeleteBanner } from "../hooks";

const POSITION_LABELS: Record<string, string> = {
  HOME: "Trang chủ",
  CATEGORY: "Danh mục",
  PRODUCT: "Sản phẩm",
  CHECKOUT: "Thanh toán",
};

export function BannersTable() {
  const { data, isLoading } = useBanners();
  const deleteMutation = useDeleteBanner();

  function handleDelete(id: string, title: string) {
    if (!confirm(`Xoá banner "${title}"?`)) return;
    deleteMutation.mutate(id, { onError: (error) => alert(getErrorMessage(error, "Không thể xoá banner.")) });
  }

  return (
    <div className="overflow-x-auto rounded-brand border-2 border-secondary bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-secondary bg-secondary/30 text-left text-xs font-semibold uppercase text-foreground/60">
          <tr>
            <th className="px-4 py-3">Ảnh</th>
            <th className="px-4 py-3">Tiêu đề</th>
            <th className="px-4 py-3">Vị trí</th>
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
              <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">Chưa có banner nào.</td>
            </tr>
          )}
          {data?.data.map((banner) => (
            <tr key={banner.id} className="hover:bg-secondary/20">
              <td className="px-4 py-3">
                <div className="relative h-10 w-16 overflow-hidden rounded-lg bg-secondary">
                  <Image src={banner.imageUrl} alt="" fill className="object-cover" />
                </div>
              </td>
              <td className="px-4 py-3 font-medium text-heading">{banner.title}</td>
              <td className="px-4 py-3 text-foreground/60">{POSITION_LABELS[banner.position]}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    banner.isActive ? "bg-success/15 text-success" : "bg-secondary text-foreground/60"
                  }`}
                >
                  {banner.isActive ? "Hoạt động" : "Tắt"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-3">
                  <Link href={`/admin/banner/${banner.id}`} className="font-semibold text-accent hover:underline">
                    Sửa
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(banner.id, banner.title)}
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
