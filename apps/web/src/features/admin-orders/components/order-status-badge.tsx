import { ORDER_STATUS_LABELS } from "@/features/order-tracking/status-labels";
import type { OrderStatus } from "../types";

const STATUS_TONE: Record<OrderStatus, string> = {
  NEW: "bg-secondary text-heading",
  CONFIRMED: "bg-primary/60 text-heading",
  ARRANGING: "bg-accent/20 text-accent",
  READY: "bg-accent/20 text-accent",
  SHIPPING: "bg-accent/20 text-accent",
  COMPLETED: "bg-success/15 text-success",
  DELIVERY_FAILED: "bg-destructive/10 text-destructive",
  CANCELLED: "bg-destructive/10 text-destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONE[status]}`}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}
