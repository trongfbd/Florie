"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Gift, Sparkles, X } from "lucide-react";
import { useCustomerAuthStore } from "@/stores/customer-auth-store";
import { useActivePopup, useClaimVoucher } from "@/features/voucher-claims/hooks";
import type { Popup } from "@/features/marketing/types";

const SESSION_KEY = "florie-popup-shown";

const CONFETTI = [
  { left: "6%", top: "10%", size: 10, delay: 0, color: "bg-white/80" },
  { left: "90%", top: "8%", size: 8, delay: 0.4, color: "bg-secondary" },
  { left: "12%", top: "88%", size: 7, delay: 0.8, color: "bg-secondary" },
  { left: "85%", top: "82%", size: 12, delay: 0.2, color: "bg-white/70" },
  { left: "48%", top: "5%", size: 6, delay: 0.6, color: "bg-white/60" },
  { left: "94%", top: "45%", size: 9, delay: 1, color: "bg-secondary" },
  { left: "4%", top: "48%", size: 8, delay: 1.2, color: "bg-white/60" },
];

function formatDiscount(voucher: Popup["voucher"]): string {
  if (!voucher) return "";
  return voucher.discountType === "PERCENTAGE"
    ? `Giảm ${voucher.discountValue}%`
    : `Giảm ${voucher.discountValue.toLocaleString("vi-VN")}đ`;
}

export function GlobalPopup() {
  const pathname = usePathname();
  const customer = useCustomerAuthStore((state) => state.customer);
  const { data: popup } = useActivePopup();
  const claimMutation = useClaimVoucher();
  const [open, setOpen] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (!popup) return;

    // Deferred via a microtask (rather than called synchronously in the effect body) per
    // this project's react-hooks/set-state-in-effect lint rule.
    Promise.resolve().then(() => {
      if (sessionStorage.getItem(SESSION_KEY) === popup.id) return;
      setOpen(true);
      sessionStorage.setItem(SESSION_KEY, popup.id);
    });
  }, [popup]);

  if (!popup) return null;

  function handleClaim() {
    if (!popup) return;
    claimMutation.mutate(popup.id, { onSuccess: () => setClaimed(true) });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-b from-accent to-heading shadow-2xl shadow-black/40"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng"
              className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:rotate-90 hover:bg-white/30"
            >
              <X size={16} />
            </button>

            {/* Confetti */}
            {CONFETTI.map((c, i) => (
              <motion.span
                key={i}
                className={`pointer-events-none absolute z-10 rounded-full ${c.color}`}
                style={{ left: c.left, top: c.top, width: c.size, height: c.size }}
                animate={{ y: [0, -8, 0], opacity: [0.9, 0.5, 0.9] }}
                transition={{ duration: 2.4, delay: c.delay, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}

            <div className="relative px-6 pb-7 pt-9 text-center">
              {/* Voucher ticket */}
              <div className="relative mx-auto mb-5 w-full max-w-[260px]">
                <div className="overflow-hidden rounded-xl bg-white shadow-lg">
                  {popup.imageUrl ? (
                    <div className="relative h-28 w-full">
                      <Image src={popup.imageUrl} alt="" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-28 w-full flex-col items-center justify-center gap-1 bg-secondary">
                      <Gift size={32} className="text-accent" strokeWidth={1.5} />
                      {popup.voucher && (
                        <p className="font-display text-sm font-extrabold text-accent">
                          {formatDiscount(popup.voucher)}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="border-t-2 border-dashed border-secondary px-4 py-3">
                    <p className="font-display text-lg font-extrabold uppercase leading-tight text-accent">
                      {popup.title}
                    </p>
                    {popup.voucher && (
                      <p className="mt-1 font-mono text-xs font-bold tracking-wider text-heading/70">
                        Mã: {popup.voucher.code}
                      </p>
                    )}
                  </div>
                </div>
                {/* Ticket notches — sit on the outer (non-clipped) wrapper so they poke past the ticket edge */}
                <span className="absolute -left-3 top-28 h-6 w-6 -translate-y-1/2 rounded-full bg-heading" />
                <span className="absolute -right-3 top-28 h-6 w-6 -translate-y-1/2 rounded-full bg-heading" />
              </div>

              {popup.content && (
                <p className="mx-auto max-w-xs text-sm font-medium leading-relaxed text-white/90">
                  {popup.content}
                </p>
              )}

              <div className="mt-4 flex flex-col items-center gap-2">
                {claimed ? (
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-5 py-2.5 text-sm font-bold text-white">
                    <Check size={16} />
                    Đã lưu vào tài khoản!
                  </p>
                ) : customer ? (
                  <button
                    type="button"
                    onClick={handleClaim}
                    disabled={claimMutation.isPending}
                    className="group inline-flex items-center gap-1.5 rounded-full bg-white px-8 py-3 text-sm font-bold text-accent shadow-lg shadow-black/20 transition-all hover:scale-105 hover:shadow-xl disabled:opacity-60"
                  >
                    <Sparkles size={15} className="transition-transform group-hover:rotate-12" />
                    {claimMutation.isPending ? "Đang lưu..." : "Nhận ưu đãi ngay"}
                  </button>
                ) : (
                  <Link
                    href={`/dang-nhap?redirect=${encodeURIComponent(pathname)}`}
                    onClick={() => setOpen(false)}
                    className="group inline-flex items-center gap-1.5 rounded-full bg-white px-8 py-3 text-sm font-bold text-accent shadow-lg shadow-black/20 transition-all hover:scale-105 hover:shadow-xl"
                  >
                    <Sparkles size={15} className="transition-transform group-hover:rotate-12" />
                    Đăng nhập để nhận ưu đãi
                  </Link>
                )}

                {claimed && popup.linkUrl && (
                  <Link
                    href={popup.linkUrl}
                    onClick={() => setOpen(false)}
                    className="text-xs font-semibold text-white/80 underline-offset-2 hover:underline"
                  >
                    Mua ngay →
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
