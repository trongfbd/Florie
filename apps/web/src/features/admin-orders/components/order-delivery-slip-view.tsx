"use client";

import { Printer } from "lucide-react";
import { formatVnd } from "@/lib/format";
import { useOrder } from "../hooks";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function OrderDeliverySlipView({ orderId }: { orderId: string }) {
  const { data: order, isLoading } = useOrder(orderId);

  if (isLoading || !order) {
    return <p className="p-8 text-center text-foreground/60">Đang tải...</p>;
  }

  const amountDue = order.paymentStatus === "PAID" ? 0 : order.total - order.depositAmount;

  return (
    <div className="mx-auto max-w-xl p-6 print:p-0">
      <button
        type="button"
        onClick={() => window.print()}
        className="mb-6 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105 print:hidden"
      >
        <Printer size={16} />
        In phiếu giao hàng
      </button>

      <div className="rounded-brand border-2 border-secondary bg-white p-8 print:border-0 print:p-0 print:shadow-none">
        <div className="flex items-start justify-between border-b-2 border-dashed border-secondary pb-4">
          <p className="font-display text-xl font-bold uppercase text-heading">Phiếu giao hàng</p>
          <p className="text-sm font-semibold text-heading">{order.orderNumber}</p>
        </div>

        <div className="mt-4 space-y-2 text-base">
          <p>
            <span className="font-semibold text-heading">Người nhận: </span>
            {order.recipientName}
          </p>
          <p>
            <span className="font-semibold text-heading">SĐT: </span>
            {order.recipientPhone}
          </p>
          <p>
            <span className="font-semibold text-heading">Địa chỉ: </span>
            {order.deliveryAddress}
            {order.deliveryDistrict && ` (${order.deliveryDistrict})`}
          </p>
          <p>
            <span className="font-semibold text-heading">Khung giờ giao: </span>
            {formatDate(order.deliveryDate)} {order.deliveryTime ?? ""}
          </p>
          {order.cardMessage && (
            <p>
              <span className="font-semibold text-heading">Thiệp: </span>
              {order.cardMessage}
            </p>
          )}
        </div>

        <div className="mt-6 rounded-lg bg-secondary/30 p-4 text-center">
          <p className="text-xs font-semibold uppercase text-foreground/50">Số tiền cần thu</p>
          <p className="mt-1 font-display text-3xl font-bold text-accent">{formatVnd(amountDue)}</p>
          {amountDue === 0 && <p className="mt-1 text-sm text-success">Đã thanh toán đủ</p>}
        </div>
      </div>
    </div>
  );
}
