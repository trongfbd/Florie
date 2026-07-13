"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, useCartSubtotal } from "@/stores/cart-store";
import { formatVnd } from "@/lib/format";

export function CartPageContent() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartSubtotal();

  if (items.length === 0) {
    return (
      <div className="rounded-brand border-2 border-dashed border-secondary bg-secondary/30 p-16 text-center">
        <p className="text-lg font-semibold text-heading">Giỏ hàng của bạn đang trống</p>
        <Link
          href="/tim-kiem"
          className="mt-4 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-accent/30 transition-transform hover:scale-105"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex gap-4 rounded-brand border-2 border-secondary bg-white p-4"
          >
            <Link href={`/san-pham/${item.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
              {item.imageUrl && (
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              )}
            </Link>

            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/san-pham/${item.slug}`} className="font-semibold text-heading hover:text-accent">
                  {item.name}
                </Link>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  aria-label="Xoá"
                  className="text-foreground/40 transition-colors hover:text-destructive"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-full border-2 border-secondary px-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-heading hover:bg-secondary"
                    aria-label="Giảm số lượng"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-heading hover:bg-secondary"
                    aria-label="Tăng số lượng"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="font-bold text-accent">
                  {formatVnd(item.unitPrice * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-fit space-y-4 rounded-brand border-2 border-secondary bg-secondary/40 p-6">
        <h2 className="font-display text-xl font-bold text-heading">Tóm tắt đơn hàng</h2>
        <div className="flex justify-between text-sm text-foreground/70">
          <span>Tạm tính</span>
          <span className="font-semibold text-heading">{formatVnd(subtotal)}</span>
        </div>
        <p className="text-xs text-foreground/50">Phí vận chuyển sẽ được tính ở bước thanh toán.</p>
        <Link
          href="/thanh-toan"
          className="block w-full rounded-full bg-accent px-6 py-3 text-center text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-[1.02]"
        >
          Tiến hành thanh toán
        </Link>
      </div>
    </div>
  );
}
