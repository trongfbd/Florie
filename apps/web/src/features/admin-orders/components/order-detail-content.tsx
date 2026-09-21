"use client";

import { useState } from "react";
import Link from "next/link";
import { Printer } from "lucide-react";
import { formatVnd } from "@/lib/format";
import { getErrorMessage } from "@/lib/get-error-message";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-method-labels";
import { ORDER_STATUS_LABELS } from "@/features/order-tracking/status-labels";
import { useChangeOrderStatus, useOrder, useUpdateOrderPayment } from "../hooks";
import { ALLOWED_TRANSITIONS } from "../lib/status-transitions";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONE } from "../lib/payment-status-labels";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderImagesManager } from "./order-images-manager";
import { ItemCostPriceEditor } from "./item-cost-price-editor";
import { ShippingInfoSection } from "./shipping-info-section";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderDetailContent({ orderId }: { orderId: string }) {
  const { data: order, isLoading } = useOrder(orderId);
  const changeStatus = useChangeOrderStatus(orderId);
  const updatePayment = useUpdateOrderPayment(orderId);
  const [note, setNote] = useState("");
  const [depositInput, setDepositInput] = useState("");

  if (isLoading || !order) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  const nextStatuses = ALLOWED_TRANSITIONS[order.status];
  const amountDue = order.paymentStatus === "PAID" ? 0 : order.total - order.depositAmount;

  function markDeposited() {
    const amount = Number(depositInput);
    if (!Number.isFinite(amount) || amount <= 0) return;
    updatePayment.mutate({ paymentStatus: "DEPOSITED", depositAmount: amount });
  }

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
          <Link
            href={`/admin/phieu-giao-hang/${order.id}`}
            target="_blank"
            className="flex items-center gap-2 rounded-full border-2 border-secondary px-4 py-2 text-sm font-semibold text-heading transition-colors hover:bg-secondary"
          >
            <Printer size={16} />
            Phiếu giao hàng
          </Link>
          <Link
            href={`/admin/hoa-don/${order.id}`}
            target="_blank"
            className="flex items-center gap-2 rounded-full border-2 border-secondary px-4 py-2 text-sm font-semibold text-heading transition-colors hover:bg-secondary"
          >
            <Printer size={16} />
            In hóa đơn
          </Link>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {changeStatus.isError && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          Không thể chuyển trạng thái — vui lòng thử lại.
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
              className={`rounded-full px-5 py-2 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 disabled:opacity-60 ${
                next === "CANCELLED" ? "bg-destructive shadow-destructive/30" : "bg-accent shadow-accent/30"
              }`}
            >
              {next === "CANCELLED" ? "Huỷ đơn" : `Chuyển sang: ${ORDER_STATUS_LABELS[next]}`}
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
                <li key={item.id} className="space-y-1.5 py-2 text-sm">
                  <div className="flex justify-between">
                    <span>
                      {item.itemName} × {item.quantity}
                    </span>
                    <span className="font-medium text-heading">{formatVnd(item.subtotal)}</span>
                  </div>
                  <ItemCostPriceEditor orderId={order.id} item={item} />
                </li>
              ))}
            </ul>
            <div className="space-y-1 border-t border-secondary pt-3 text-sm">
              <div className="flex justify-between text-foreground/70">
                <span>Tạm tính</span>
                <span>{formatVnd(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Giảm giá {order.voucher ? `(${order.voucher.code})` : ""}</span>
                  <span>-{formatVnd(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-foreground/70">
                <span>Phí vận chuyển</span>
                <span>{formatVnd(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-heading">
                <span>Tổng cộng</span>
                <span>{formatVnd(order.total)}</span>
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-brand border-2 border-secondary bg-white p-5">
            <h2 className="font-display text-lg font-bold text-heading">Lịch sử xử lý</h2>
            <ul className="space-y-3">
              {order.statusHistory.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 text-sm">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  <div>
                    <p className="font-medium text-heading">
                      {entry.fromStatus ? `${ORDER_STATUS_LABELS[entry.fromStatus]} → ` : ""}
                      {ORDER_STATUS_LABELS[entry.toStatus]}
                    </p>
                    <p className="text-xs text-foreground/50">
                      {formatDateTime(entry.changedAt)} {entry.changedBy ? `· ${entry.changedBy.name}` : ""}
                    </p>
                    {entry.note && <p className="mt-0.5 text-xs text-foreground/70">{entry.note}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <ShippingInfoSection order={order} />

          <section className="space-y-2 rounded-brand border-2 border-secondary bg-white p-5 text-sm">
            <h2 className="font-display text-lg font-bold text-heading">Khách hàng</h2>
            {order.customer ? (
              <p className="font-medium text-heading">{order.customer.name}</p>
            ) : (
              <p className="font-medium text-heading">{order.guestName} (khách vãng lai)</p>
            )}
            <p className="text-foreground/60">{order.customer?.phone ?? order.guestPhone}</p>
          </section>

          <section className="space-y-3 rounded-brand border-2 border-secondary bg-white p-5 text-sm">
            <h2 className="font-display text-lg font-bold text-heading">Thanh toán</h2>
            <p className="text-foreground/60">
              Phương thức: {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
            </p>
            <span
              className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${PAYMENT_STATUS_TONE[order.paymentStatus]}`}
            >
              {PAYMENT_STATUS_LABELS[order.paymentStatus]}
            </span>
            {order.depositAmount > 0 && (
              <p className="text-foreground/60">Đã cọc: {formatVnd(order.depositAmount)}</p>
            )}
            <p className="font-bold text-heading">Còn phải thu: {formatVnd(amountDue)}</p>

            {order.paymentStatus !== "PAID" && (
              <div className="space-y-2 border-t border-secondary pt-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    placeholder="Số tiền cọc"
                    value={depositInput}
                    onChange={(e) => setDepositInput(e.target.value)}
                    className="w-32 rounded-lg border-2 border-secondary px-2 py-1.5 text-sm outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    disabled={updatePayment.isPending}
                    onClick={markDeposited}
                    className="rounded-full border-2 border-accent px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/10 disabled:opacity-60"
                  >
                    Đánh dấu đã cọc
                  </button>
                </div>
                <button
                  type="button"
                  disabled={updatePayment.isPending}
                  onClick={() => updatePayment.mutate({ paymentStatus: "PAID" })}
                  className="w-full rounded-full bg-success/90 px-3 py-1.5 text-xs font-bold text-white hover:bg-success disabled:opacity-60"
                >
                  Đánh dấu đã thanh toán đủ
                </button>
              </div>
            )}
            {updatePayment.isError && (
              <p className="text-xs text-destructive">
                {getErrorMessage(updatePayment.error, "Không thể cập nhật thanh toán.")}
              </p>
            )}
          </section>

          <OrderImagesManager orderId={order.id} images={order.images} />
        </div>
      </div>
    </div>
  );
}
