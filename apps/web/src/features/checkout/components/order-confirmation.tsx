"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useLastOrderStore } from "@/stores/last-order-store";
import { formatVnd } from "@/lib/format";

export function OrderConfirmation({ orderNumber }: { orderNumber: string }) {
  const order = useLastOrderStore((state) => state.order);
  const matchesLastOrder = order?.orderNumber === orderNumber;

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <CheckCircle2 className="mx-auto text-success" size={64} />
      <h1 className="font-display text-3xl font-bold text-heading">Đặt hàng thành công!</h1>
      <p className="text-foreground/70">
        Cảm ơn bạn đã đặt hoa tại Bèo Flower Corner. Mã đơn hàng của bạn là:
      </p>
      <p className="font-display text-2xl font-bold text-accent">{orderNumber}</p>

      {matchesLastOrder && order && (
        <div className="space-y-1 rounded-brand border-2 border-secondary bg-secondary/40 p-5 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/70">Người nhận</span>
            <span className="font-semibold text-heading">{order.recipientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/70">Ngày giao</span>
            <span className="font-semibold text-heading">{order.deliveryDate.slice(0, 10)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-secondary pt-2 text-base">
            <span className="font-semibold text-heading">Tổng cộng</span>
            <span className="font-bold text-accent">{formatVnd(order.total)}</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link
          href={`/theo-doi-don-hang?orderNumber=${encodeURIComponent(orderNumber)}`}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-accent/30 transition-transform hover:scale-105"
        >
          Theo dõi đơn hàng
        </Link>
        <Link
          href="/"
          className="rounded-full border-2 border-secondary px-6 py-2.5 text-sm font-bold text-heading transition-colors hover:border-accent hover:text-accent"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
