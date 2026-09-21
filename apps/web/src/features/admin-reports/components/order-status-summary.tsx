"use client";

import { ORDER_STATUS_LABELS } from "@/features/order-tracking/status-labels";
import { useOrderStatusBreakdown } from "../hooks";

const STATUS_TONE: Record<string, string> = {
  NEW: "bg-secondary text-heading",
  CONFIRMED: "bg-primary/60 text-heading",
  ARRANGING: "bg-accent/20 text-accent",
  READY: "bg-accent/20 text-accent",
  SHIPPING: "bg-accent/20 text-accent",
  COMPLETED: "bg-success/15 text-success",
  DELIVERY_FAILED: "bg-destructive/10 text-destructive",
  CANCELLED: "bg-destructive/10 text-destructive",
};

export function OrderStatusSummary() {
  const { data, isLoading } = useOrderStatusBreakdown();

  if (isLoading || !data) {
    return <div className="h-20 animate-pulse rounded-brand bg-secondary/50" />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Object.entries(data).map(([status, count]) => (
        <div key={status} className={`rounded-lg px-3 py-2.5 ${STATUS_TONE[status] ?? "bg-secondary text-heading"}`}>
          <p className="text-xs font-semibold">{ORDER_STATUS_LABELS[status] ?? status}</p>
          <p className="font-display text-xl font-bold">{count}</p>
        </div>
      ))}
    </div>
  );
}
