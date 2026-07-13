import { create } from "zustand";
import type { CheckoutOrderResult } from "@/features/checkout/types";

interface LastOrderState {
  order: CheckoutOrderResult | null;
  setOrder: (order: CheckoutOrderResult) => void;
}

// Transient (not persisted) — only used to show full details on the
// confirmation page right after checkout. A page refresh loses it, which
// is fine: the user can still track the order via /theo-doi-don-hang.
export const useLastOrderStore = create<LastOrderState>((set) => ({
  order: null,
  setOrder: (order) => set({ order }),
}));
