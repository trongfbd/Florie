"use client";

import { useEffect, useRef, useState } from "react";

interface PaginatedLike {
  meta: { total: number };
}

interface ToastState {
  message: string;
  variant: "found" | "empty";
}

const AUTO_HIDE_MS = 3000;

// Thông báo nhỏ dưới góc account profile (topbar) sau khi tìm kiếm xong —
// "tìm thấy bao nhiêu item" (xanh) hoặc "không tìm thấy" (hồng đỏ nhẹ). Chỉ
// bắn 1 lần mỗi lượt search mới (so với search đã submit lần trước), không
// bắn lại khi phân trang/refetch nền, và không bắn khi search rỗng.
export function useSearchResultToast(search: string | undefined, data: PaginatedLike | undefined, isLoading: boolean) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const lastSearchRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!search) {
      lastSearchRef.current = search;
      return;
    }
    if (isLoading || search === lastSearchRef.current || !data) {
      return;
    }
    lastSearchRef.current = search;
    const total = data.meta.total;
    setToast(
      total > 0
        ? { message: `Tìm thấy ${total} kết quả cho "${search}"`, variant: "found" }
        : { message: `Không tìm thấy kết quả nào cho "${search}"`, variant: "empty" },
    );
  }, [search, data, isLoading]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  return { toast, dismiss: () => setToast(null) };
}

const VARIANT_CLASSES: Record<ToastState["variant"], string> = {
  found: "bg-success text-white",
  empty: "bg-destructive text-white",
};

export function SearchResultToast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-xl ${VARIANT_CLASSES[toast.variant]}`}
    >
      {toast.message}
      <button type="button" aria-label="Đóng" onClick={onDismiss} className="opacity-60 hover:opacity-100">
        ×
      </button>
    </div>
  );
}
