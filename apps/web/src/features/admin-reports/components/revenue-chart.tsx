"use client";

import { formatVnd } from "@/lib/format";
import { useRevenueSeries } from "../hooks";

function formatShortDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}

export function RevenueChart() {
  const { data, isLoading } = useRevenueSeries();

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-brand bg-secondary/50" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-brand border border-dashed border-secondary text-sm text-foreground/50">
        Chưa có doanh thu trong 30 ngày qua
      </div>
    );
  }

  const max = Math.max(...data.map((point) => point.revenue));

  return (
    <div className="flex h-48 items-end gap-1.5">
      {data.map((point) => (
        <div key={point.date} className="flex flex-1 flex-col items-center gap-1.5">
          <div
            title={`${formatShortDate(point.date)}: ${formatVnd(point.revenue)} (${point.orderCount} đơn)`}
            className="w-full rounded-t bg-accent transition-all hover:bg-heading"
            style={{ height: `${Math.max(4, Math.round((point.revenue / max) * 160))}px` }}
          />
          <span className="text-[10px] text-foreground/40">{formatShortDate(point.date)}</span>
        </div>
      ))}
    </div>
  );
}
