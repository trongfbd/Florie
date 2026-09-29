"use client";

import Link from "next/link";
import { useState } from "react";
import { Printer } from "lucide-react";
import { getErrorMessage } from "@/lib/get-error-message";
import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { ORDER_STATUS_LABELS } from "@/features/order-tracking/status-labels";
import { useChangeOrderStatus, useOrder } from "../hooks";
import { ALLOWED_TRANSITIONS, canTransition } from "../lib/status-transitions";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderImagesManager } from "./order-images-manager";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Chỉ thông tin vận hành cho STAFF — người nhận/địa chỉ/ngày giờ/sản
// phẩm+số lượng/thiệp/ghi chú, không có tiền ở bất kỳ đâu (không tái dùng
// OrderDetailContent/ShippingInfoSection vì 2 chỗ đó đan xen tiền + có nút
// sửa thông tin giao hàng mà STAFF không được phép gọi). Không có link "In
// hóa đơn"/"Phiếu giao hàng" (đều có số tiền) — chỉ "Phiếu làm hoa".
export function OrderDetailStaffView({ orderId }: { orderId: string }) {
  const { data: order, isLoading } = useOrder(orderId);
  const changeStatus = useChangeOrderStatus(orderId);
  const role = useAdminAuthStore((state) => state.admin?.role);
  const [note, setNote] = useState("");

  if (isLoading || !order) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  const nextStatuses = ALLOWED_TRANSITIONS[order.status].filter(
    (next) => role && canTransition(order.status, next, role),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-heading">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-foreground/60">Đặt lúc {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/phieu-lam-hoa/${order.id}`}
            target="_blank"
            className="flex items-center gap-2 rounded-full border-2 border-secondary px-4 py-2 text-sm font-semibold text-heading transition-colors hover:bg-secondary"
          >
            <Printer size={16} />
            Phiếu làm hoa
          </Link>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {changeStatus.isError && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {getErrorMessage(changeStatus.error, "Không thể chuyển trạng thái — vui lòng thử lại.")}
        </p>
      )}

      {nextStatuses.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-brand border-2 border-secondary bg-white p-4">
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ghi chú (không bắt buộc)"
            className="flex-1 rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {nextStatuses.map((next) => (
            <button
              key={next}
              type="button"
              disabled={changeStatus.isPending}
              onClick={() => changeStatus.mutate({ toStatus: next, note: note || undefined })}
              className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-white shadow-md shadow-accent/30 transition-transform hover:scale-105 disabled:opacity-60"
            >
              Chuyển sang: {ORDER_STATUS_LABELS[next]}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="space-y-3 rounded-brand border-2 border-secondary bg-white p-5">
            <h2 className="font-display text-lg font-bold text-heading">Sản phẩm</h2>
            <ul className="divide-y divide-secondary">
              {order.items.map((item) => (
                <li key={item.id} className="py-2 text-sm">
                  {item.itemName} × {item.quantity}
                </li>
              ))}
            </ul>
          </section>

          <OrderImagesManager orderId={order.id} images={order.images} />
        </div>

        <div className="space-y-6">
          <section className="space-y-2 rounded-brand border-2 border-secondary bg-white p-5 text-sm">
            <h2 className="font-display text-lg font-bold text-heading">Giao hàng</h2>
            <p>
              <span className="text-foreground/50">Người nhận: </span>
              <span className="font-medium text-heading">{order.recipientName}</span>
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
        </div>
      </div>
    </div>
  );
}
