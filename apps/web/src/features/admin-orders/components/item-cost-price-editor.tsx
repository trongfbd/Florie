"use client";

import { useState } from "react";
import { formatVnd } from "@/lib/format";
import { getErrorMessage } from "@/lib/get-error-message";
import { useUpdateItemCostPrice } from "../hooks";
import type { OrderItemRow } from "../types";

/** Inline giá gốc (costPrice) editor for one order item -- opens straight
 * into edit mode when the value is missing (the "Thiếu giá gốc" filter's
 * whole purpose is to get these filled in), otherwise shows the value with
 * a "Sửa" link. Editable regardless of order status -- see
 * OrdersService.updateItemCostPrice's doc comment for why. */
export function ItemCostPriceEditor({ orderId, item }: { orderId: string; item: OrderItemRow }) {
  const updateCostPrice = useUpdateItemCostPrice(orderId);
  const [isEditing, setIsEditing] = useState(item.costPrice == null);
  const [value, setValue] = useState(item.costPrice != null ? String(item.costPrice) : "");

  function handleSave() {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) return;
    updateCostPrice.mutate({ itemId: item.id, costPrice: amount }, { onSuccess: () => setIsEditing(false) });
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2 text-xs text-foreground/50">
        <span>Giá gốc: {formatVnd(item.costPrice ?? 0)}</span>
        <button
          type="button"
          onClick={() => {
            setValue(item.costPrice != null ? String(item.costPrice) : "");
            setIsEditing(true);
          }}
          className="font-semibold text-accent hover:underline"
        >
          Sửa
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {item.costPrice == null && <span className="text-xs font-semibold text-destructive">Thiếu giá gốc</span>}
      <input
        type="number"
        min={0}
        placeholder="Giá gốc"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-28 rounded-lg border-2 border-secondary px-2 py-1 text-xs outline-none focus:border-accent"
      />
      <button
        type="button"
        disabled={updateCostPrice.isPending}
        onClick={handleSave}
        className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
      >
        Lưu
      </button>
      {item.costPrice != null && (
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="text-xs text-foreground/40 hover:underline"
        >
          Huỷ
        </button>
      )}
      {updateCostPrice.isError && (
        <span className="text-xs text-destructive">
          {getErrorMessage(updateCostPrice.error, "Không thể lưu giá gốc.")}
        </span>
      )}
    </div>
  );
}
