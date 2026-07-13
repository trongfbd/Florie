"use client";

import { formatVnd } from "@/lib/format";
import { useRevenueSeries } from "../hooks";

function formatShortDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}

/** Compact VND for on-chart labels — full precision stays in the hover title. */
function formatCompactVnd(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}tr`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }
  return String(value);
}

const CHART_HEIGHT = 96;

export function RevenueChart() {
  const { data, isLoading } = useRevenueSeries();

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-brand bg-secondary/50" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-brand border border-dashed border-secondary text-sm text-foreground/50">
        Chưa có doanh thu trong 30 ngày qua
      </div>
    );
  }

  const max = Math.max(...data.map((point) => point.revenue));

  return (
    <div className="flex items-end gap-1" style={{ height: CHART_HEIGHT + 34 }}>
      {data.map((point) => (
        <div key={point.date} className="flex flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[9px] font-semibold leading-none text-foreground/60">
            {point.revenue > 0 ? formatCompactVnd(point.revenue) : ""}
          </span>
          <div
            title={`${formatShortDate(point.date)}: ${formatVnd(point.revenue)} (${point.orderCount} đơn)`}
            className="w-full rounded-t bg-success transition-colors hover:bg-success-foreground"
            style={{ height: Math.max(3, Math.round((point.revenue / max) * CHART_HEIGHT)) }}
          />
          <span className="text-[9px] text-foreground/40">{formatShortDate(point.date)}</span>
        </div>
      ))}
    </div>
  );
}
