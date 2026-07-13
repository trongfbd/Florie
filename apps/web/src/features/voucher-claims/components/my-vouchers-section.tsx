"use client";

import { Ticket } from "lucide-react";
import { formatVnd } from "@/lib/format";
import { useMyVouchers } from "../hooks";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function MyVouchersSection() {
  const { data: claims, isLoading } = useMyVouchers();

  if (isLoading) {
    return <div className="h-24 animate-pulse rounded-brand bg-secondary/50" />;
  }

  if (!claims || claims.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-bold text-heading">Voucher của tôi</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {claims.map((claim) => (
          <div
            key={claim.id}
            className="flex items-center gap-3 rounded-brand border-2 border-dashed border-accent/40 bg-secondary/20 p-4"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Ticket size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-base font-bold text-heading">{claim.voucher.code}</p>
              <p className="text-xs text-foreground/60">
                {claim.voucher.discountType === "PERCENTAGE"
                  ? `Giảm ${claim.voucher.discountValue}%`
                  : `Giảm ${formatVnd(claim.voucher.discountValue)}`}
                {claim.voucher.minOrderValue > 0 && ` · Đơn từ ${formatVnd(claim.voucher.minOrderValue)}`}
              </p>
              <p className="text-xs text-foreground/40">Hạn dùng: {formatDate(claim.voucher.endAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
