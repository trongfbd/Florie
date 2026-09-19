"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCartStore, useCartSubtotal } from "@/stores/cart-store";
import { formatVnd } from "@/lib/format";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartSubtotal();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/45"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 right-0 z-[120] flex w-full max-w-sm flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b-2 border-secondary px-5 py-4">
              <h2 className="font-display text-lg font-bold text-heading">Giỏ hàng</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                className="rounded-full p-2 text-foreground/50 transition-colors hover:bg-secondary"
              >
                <X size={18} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <ShoppingBag size={40} className="text-foreground/20" />
                <p className="text-sm text-foreground/60">Giỏ hàng của bạn đang trống</p>
                <Link
                  href="/tim-kiem"
                  onClick={onClose}
                  className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-white shadow-md shadow-accent/30 transition-transform hover:scale-105"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  {items.map((item) => {
                    const href = item.kind === "combo" ? `/combo/${item.slug}` : `/san-pham/${item.slug}`;
                    return (
                      <div key={`${item.kind}-${item.id}`} className="flex gap-3">
                        <Link
                          href={href}
                          onClick={onClose}
                          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary"
                        >
                          {item.imageUrl && (
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                          )}
                        </Link>
                        <div className="flex flex-1 flex-col justify-between gap-1">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={href}
                              onClick={onClose}
                              className="line-clamp-1 text-sm font-semibold text-heading hover:text-accent"
                            >
                              {item.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id, item.kind)}
                              aria-label="Xoá"
                              className="shrink-0 text-foreground/40 transition-colors hover:text-destructive"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 rounded-full border-2 border-secondary px-1">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.kind, item.quantity - 1)}
                                aria-label="Giảm số lượng"
                                className="flex h-6 w-6 items-center justify-center rounded-full text-heading hover:bg-secondary"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-5 text-center text-xs font-semibold">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.kind, item.quantity + 1)}
                                aria-label="Tăng số lượng"
                                className="flex h-6 w-6 items-center justify-center rounded-full text-heading hover:bg-secondary"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="text-sm font-bold text-accent">
                              {formatVnd(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 border-t-2 border-secondary p-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">Tạm tính</span>
                    <span className="font-bold text-heading">{formatVnd(subtotal)}</span>
                  </div>
                  <Link
                    href="/gio-hang"
                    onClick={onClose}
                    className="block w-full rounded-full border-2 border-secondary px-5 py-2.5 text-center text-sm font-bold text-heading transition-colors hover:bg-secondary"
                  >
                    Xem giỏ hàng
                  </Link>
                  <Link
                    href="/thanh-toan"
                    onClick={onClose}
                    className="block w-full rounded-full bg-accent px-5 py-2.5 text-center text-sm font-bold text-white shadow-md shadow-accent/30 transition-transform hover:scale-[1.02]"
                  >
                    Đặt hàng
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
