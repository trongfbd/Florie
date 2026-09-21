"use client";

import Image from "next/image";
import { Printer } from "lucide-react";
import { useOrder } from "../hooks";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function OrderFloristSlipView({ orderId }: { orderId: string }) {
  const { data: order, isLoading } = useOrder(orderId);

  if (isLoading || !order) {
    return <p className="p-8 text-center text-foreground/60">Đang tải...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl p-6 print:p-0">
      <button
        type="button"
        onClick={() => window.print()}
        className="mb-6 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105 print:hidden"
      >
        <Printer size={16} />
        In phiếu làm hoa
      </button>

      <div className="rounded-brand border-2 border-secondary bg-white p-8 print:border-0 print:p-0 print:shadow-none">
        <div className="flex items-start justify-between border-b-2 border-dashed border-secondary pb-4">
          <p className="font-display text-xl font-bold uppercase text-heading">Phiếu làm hoa</p>
          <div className="text-right text-sm">
            <p className="font-semibold text-heading">{order.orderNumber}</p>
            <p className="text-foreground/60">
              Giao: {formatDate(order.deliveryDate)} {order.deliveryTime ?? ""}
            </p>
          </div>
        </div>

        {order.cardMessage && (
          <div className="mt-4 rounded-lg bg-secondary/30 p-4">
            <p className="text-xs font-semibold uppercase text-foreground/50">Nội dung thiệp</p>
            <p className="mt-1 text-base font-medium text-heading">{order.cardMessage}</p>
          </div>
        )}

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase text-foreground/50">Sản phẩm</p>
          <ul className="mt-2 divide-y divide-secondary">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-2 text-base">
                <span className="font-medium text-heading">{item.itemName}</span>
                <span className="font-bold text-heading">× {item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>

        {order.images.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase text-foreground/50">Ảnh mẫu khách gửi</p>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {order.images.map((image) => (
                <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg border-2 border-secondary">
                  <Image src={image.url} alt={image.altText ?? ""} fill sizes="200px" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {order.note && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase text-foreground/50">Ghi chú nội bộ</p>
            <p className="mt-1 text-sm text-heading">{order.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}
