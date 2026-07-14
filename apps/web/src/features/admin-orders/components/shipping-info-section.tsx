"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { getErrorMessage } from "@/lib/get-error-message";
import { useUpdateOrder } from "../hooks";
import type { OrderDetail, UpdateOrderInput } from "../types";

const EDITABLE_STATUSES = ["NEW", "CONFIRMED"];

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export function ShippingInfoSection({ order }: { order: OrderDetail }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdateOrderInput>({});
  const updateMutation = useUpdateOrder(order.id);
  const canEdit = EDITABLE_STATUSES.includes(order.status);

  function startEditing() {
    setForm({
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone,
      deliveryAddress: order.deliveryAddress,
      deliveryDate: toDateInputValue(order.deliveryDate),
      deliveryTime: order.deliveryTime ?? "",
      cardMessage: order.cardMessage ?? "",
      note: order.note ?? "",
    });
    setIsEditing(true);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    updateMutation.mutate(form, { onSuccess: () => setIsEditing(false) });
  }

  if (!isEditing) {
    return (
      <section className="space-y-2 rounded-brand border-2 border-secondary bg-white p-5 text-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-heading">Giao hàng</h2>
          {canEdit && (
            <button
              type="button"
              onClick={startEditing}
              className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
            >
              <Pencil size={13} />
              Sửa
            </button>
          )}
        </div>
        <p>
          <span className="text-foreground/50">Người nhận: </span>
          <span className="font-medium text-heading">{order.recipientName}</span>
        </p>
        <p>
          <span className="text-foreground/50">SĐT: </span>
          {order.recipientPhone}
        </p>
        <p>
          <span className="text-foreground/50">Địa chỉ: </span>
          {order.deliveryAddress}
        </p>
        <p>
          <span className="text-foreground/50">Ngày giao: </span>
          {new Date(order.deliveryDate).toLocaleDateString("vi-VN")}
          {order.deliveryTime ? ` (${order.deliveryTime})` : ""}
        </p>
        {order.cardMessage && (
          <p>
            <span className="text-foreground/50">Lời nhắn thiệp: </span>
            {order.cardMessage}
          </p>
        )}
        {order.note && (
          <p>
            <span className="text-foreground/50">Ghi chú: </span>
            {order.note}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-brand border-2 border-accent bg-white p-5 text-sm">
      <h2 className="font-display text-lg font-bold text-heading">Sửa thông tin giao hàng</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-heading">Người nhận</label>
          <input
            value={form.recipientName ?? ""}
            onChange={(event) => setForm((prev) => ({ ...prev, recipientName: event.target.value }))}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-heading">SĐT người nhận</label>
          <input
            value={form.recipientPhone ?? ""}
            onChange={(event) => setForm((prev) => ({ ...prev, recipientPhone: event.target.value }))}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-heading">Địa chỉ giao hàng</label>
          <input
            value={form.deliveryAddress ?? ""}
            onChange={(event) => setForm((prev) => ({ ...prev, deliveryAddress: event.target.value }))}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-heading">Ngày giao</label>
            <input
              type="date"
              value={form.deliveryDate ?? ""}
              onChange={(event) => setForm((prev) => ({ ...prev, deliveryDate: event.target.value }))}
              className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-heading">Khung giờ</label>
            <input
              value={form.deliveryTime ?? ""}
              onChange={(event) => setForm((prev) => ({ ...prev, deliveryTime: event.target.value }))}
              placeholder="VD: 09:00 - 11:00"
              className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-heading">Lời nhắn thiệp</label>
          <textarea
            rows={2}
            value={form.cardMessage ?? ""}
            onChange={(event) => setForm((prev) => ({ ...prev, cardMessage: event.target.value }))}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-heading">Ghi chú</label>
          <textarea
            rows={2}
            value={form.note ?? ""}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        {updateMutation.isError && (
          <p className="text-xs text-destructive">
            {getErrorMessage(updateMutation.error, "Không lưu được — vui lòng thử lại.")}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-white shadow-md shadow-accent/30 transition-transform hover:scale-105 disabled:opacity-60"
          >
            {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-full border-2 border-secondary px-5 py-2 text-sm font-semibold text-heading hover:bg-secondary"
          >
            Huỷ
          </button>
        </div>
      </form>
    </section>
  );
}
