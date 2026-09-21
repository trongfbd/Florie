import type { OrderStatus } from "../types";

// Mirrors ALLOWED_TRANSITIONS in apps/api/src/orders/orders.service.ts --
// keep both in sync when the pipeline changes. Shared here so the order
// detail page and the list's quick-status dropdown don't each keep their
// own copy that can silently drift apart.
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["ARRANGING", "CANCELLED"],
  ARRANGING: ["READY", "CANCELLED"],
  READY: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["COMPLETED", "DELIVERY_FAILED", "CANCELLED"],
  COMPLETED: [],
  DELIVERY_FAILED: ["SHIPPING", "CANCELLED"],
  CANCELLED: [],
};
