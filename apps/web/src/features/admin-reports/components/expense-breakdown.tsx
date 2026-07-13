"use client";

import { formatVnd } from "@/lib/format";
import { useExpensesByCategory } from "../hooks";

const CATEGORY_LABELS: Record<string, string> = {
  FACEBOOK_ADS: "Facebook Ads",
  TIKTOK_ADS: "TikTok Ads",
  GOOGLE_ADS: "Google Ads",
  STOCK_PURCHASE: "Nhập hàng",
  ELECTRICITY: "Điện",
  WATER: "Nước",
  INTERNET: "Internet",
  SHIPPING: "Vận chuyển",
  SALARY: "Lương",
  OTHER: "Khác",
};

export function ExpenseBreakdown() {
  const { data, isLoading } = useExpensesByCategory();

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-brand bg-secondary/50" />;
  }

  if (!data || data.byCategory.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-brand border border-dashed border-secondary text-sm text-foreground/50">
        Chưa có chi phí trong 30 ngày qua
      </div>
    );
  }

  const max = data.byCategory[0].total;

  return (
    <div className="space-y-3">
      {data.byCategory.map((row) => (
        <div key={row.category} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-heading">{CATEGORY_LABELS[row.category] ?? row.category}</span>
            <span className="text-foreground/60">{formatVnd(row.total)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-destructive"
              style={{ width: `${Math.max(4, Math.round((row.total / max) * 100))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
