import type { AdminRole } from "@/stores/admin-auth-store";
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

const OPS_ROLES: AdminRole[] = ["ADMIN", "OPERATIONS_ADMIN"];
const ALL_ROLES: AdminRole[] = ["ADMIN", "OPERATIONS_ADMIN", "STAFF"];

// Mirrors getAllowedRolesForTransition() in orders.service.ts — only used to
// filter which next-status options a role sees; the server is still the
// real gate (this just avoids showing a button that would 403).
export function getAllowedRolesForTransition(from: OrderStatus, to: OrderStatus): AdminRole[] {
  if (to === "CANCELLED") {
    return OPS_ROLES;
  }
  if ((from === "CONFIRMED" && to === "ARRANGING") || (from === "ARRANGING" && to === "READY")) {
    return ALL_ROLES;
  }
  return OPS_ROLES;
}

export function canTransition(from: OrderStatus, to: OrderStatus, role: AdminRole): boolean {
  return getAllowedRolesForTransition(from, to).includes(role);
}
