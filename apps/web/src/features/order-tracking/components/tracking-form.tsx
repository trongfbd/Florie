"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Circle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { formatVnd } from "@/lib/format";
import { trackOrder } from "../api";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STEPS } from "../status-labels";

export function TrackingForm() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("orderNumber") ?? "");
  const [phone, setPhone] = useState("");

  const trackMutation = useMutation({
    mutationFn: () => trackOrder(orderNumber.trim(), phone.trim()),
  });

  const order = trackMutation.data;
  const isCancelled = order?.status === "CANCELLED";
  const isDeliveryFailed = order?.status === "DELIVERY_FAILED";
  const currentStepIndex = order ? ORDER_STATUS_STEPS.indexOf(order.status as never) : -1;

  return (
    <div className="space-y-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          trackMutation.mutate();
        }}
        className="flex flex-col gap-4 rounded-brand border-2 border-secondary bg-white p-6 sm:flex-row sm:items-end"
      >
        <div className="flex-1 space-y-1">
          <label className="text-sm font-semibold text-heading">Mã đơn hàng</label>
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="VD: FL20260713-0001"
            className="w-full rounded-lg border-2 border-secondary px-3 py-2.5 text-sm outline-none focus:border-accent"
            required
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-sm font-semibold text-heading">Số điện thoại</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Số điện thoại người nhận"
            className="w-full rounded-lg border-2 border-secondary px-3 py-2.5 text-sm outline-none focus:border-accent"
            required
          />
        </div>
        <button
          type="submit"
          disabled={trackMutation.isPending}
          className="rounded-full bg-accent px-8 py-2.5 text-sm font-bold text-white shadow-md shadow-accent/30 transition-transform hover:scale-105 disabled:opacity-60"
        >
          {trackMutation.isPending ? "Đang tra cứu..." : "Tra cứu"}
        </button>
      </form>

      {trackMutation.isError && (
        <p className="rounded-brand border-2 border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Không tìm thấy đơn hàng khớp với mã đơn và số điện thoại đã nhập.
        </p>
      )}

      {order && (
        <div className="space-y-6 rounded-brand border-2 border-secondary bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm text-foreground/60">Mã đơn hàng</p>
              <p className="font-display text-xl font-bold text-heading">{order.orderNumber}</p>
            </div>
            <span
              className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                isCancelled
                  ? "bg-destructive/10 text-destructive"
                  : isDeliveryFailed
                    ? "bg-accent/10 text-accent"
                    : "bg-success/20 text-success"
              }`}
            >
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>

          {isDeliveryFailed && (
            <p className="rounded-lg bg-accent/5 p-3 text-sm text-heading">
              Lần giao gần nhất chưa thành công — shop sẽ liên hệ lại để sắp xếp giao lại sớm nhất.
            </p>
          )}

          {!isCancelled && !isDeliveryFailed && (
            <div className="flex items-center">
              {ORDER_STATUS_STEPS.map((step, index) => (
                <div key={step} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    {index <= currentStepIndex ? (
                      <CheckCircle2 className="text-success" size={22} />
                    ) : (
                      <Circle className="text-secondary" size={22} />
                    )}
                    <span className="w-16 text-center text-[11px] text-foreground/60">
                      {ORDER_STATUS_LABELS[step]}
                    </span>
                  </div>
                  {index < ORDER_STATUS_STEPS.length - 1 && (
                    <div
                      className={`mx-1 h-0.5 flex-1 ${
                        index < currentStepIndex ? "bg-success" : "bg-secondary"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-3 border-t border-secondary pt-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-foreground/60">Người nhận</p>
              <p className="font-semibold text-heading">{order.recipientName}</p>
            </div>
            <div>
              <p className="text-foreground/60">Địa chỉ giao</p>
              <p className="font-semibold text-heading">{order.deliveryAddress}</p>
            </div>
            <div>
              <p className="text-foreground/60">Ngày giao</p>
              <p className="font-semibold text-heading">
                {order.deliveryDate.slice(0, 10)} {order.deliveryTime ?? ""}
              </p>
            </div>
            <div>
              <p className="text-foreground/60">Tổng tiền</p>
              <p className="font-semibold text-accent">{formatVnd(order.total)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
