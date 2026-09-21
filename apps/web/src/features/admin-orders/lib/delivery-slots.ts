export const DELIVERY_SLOTS = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
] as const;

/**
 * Best-effort parse of the start hour from a normalized slot string (or any
 * "HH:MM..." free text) -- used for the "sắp tới giờ giao" (<2h) urgency
 * coloring on the order list. Returns null for anything that doesn't match
 * (older/freeform storefront deliveryTime values), which callers treat as
 * "skip the urgency color, fall back to date-only".
 */
export function parseSlotStartHour(deliveryTime: string | null): number | null {
  if (!deliveryTime) return null;
  const match = deliveryTime.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hour = Number(match[1]);
  return Number.isFinite(hour) ? hour : null;
}
