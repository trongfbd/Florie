"use client";

import { useState } from "react";
import { formatVnd } from "@/lib/format";
import { getErrorMessage } from "@/lib/get-error-message";
import { useUpdateShippingFee } from "../hooks";
import type { OrderDetail } from "../types";

/** Sửa phí ship thực tế (VD: chỉ biết giá sau khi book Grab lúc chuẩn bị
 * giao) -- độc lập với các bước chuyển trạng thái, không chỉ riêng lúc
 * "Đang giao", vì có thể cần sửa lại lần nữa nếu giao thất bại phải đặt xe
 * lại. Khoá khi đơn đã Đã giao/Đã huỷ (khớp với ràng buộc phía server). */
export function ShippingFeeEditor({ order }: { order: OrderDetail }) {
  const updateShippingFee = useUpdateShippingFee(order.id);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(String(order.shippingFee));

  const isLocked = order.status === "COMPLETED" || order.status === "CANCELLED";

  function handleSave() {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) return;
    updateShippingFee.mutate(amount, { onSuccess: () => setIsEditing(false) });
  }

  if (!isEditing) {
    return (
      <div className="flex justify-between text-foreground/70">
        <span className="flex items-center gap-2">
          Phí vận chuyển
          {!isLocked && (
            <button
              type="button"
              onClick={() => {
                setValue(String(order.shippingFee));
                setIsEditing(true);
              }}
              className="text-xs font-semibold text-accent hover:underline"
            >
              Sửa
            </button>
          )}
        </span>
        <span>{formatVnd(order.shippingFee)}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-foreground/70">Phí vận chuyển</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-28 rounded-lg border-2 border-secondary px-2 py-1 text-xs outline-none focus:border-accent"
          />
          <button
            type="button"
            disabled={updateShippingFee.isPending}
            onClick={handleSave}
            className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
          >
            Lưu
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-xs text-foreground/40 hover:underline"
          >
            Huỷ
          </button>
        </div>
      </div>
      {updateShippingFee.isError && (
        <p className="text-right text-xs text-destructive">
          {getErrorMessage(updateShippingFee.error, "Không thể lưu phí ship.")}
        </p>
      )}
    </div>
  );
}
