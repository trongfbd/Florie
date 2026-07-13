import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItemKind = "product" | "combo";

export interface CartItem {
  id: string; // productId or comboId depending on kind
  kind: CartItemKind;
  name: string;
  slug: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string, kind: CartItemKind) => void;
  updateQuantity: (id: string, kind: CartItemKind, quantity: number) => void;
  clear: () => void;
}

function sameItem(a: CartItem, id: string, kind: CartItemKind): boolean {
  return a.id === id && a.kind === kind;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => sameItem(i, item.id, item.kind));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameItem(i, item.id, item.kind) ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),

      removeItem: (id, kind) =>
        set((state) => ({ items: state.items.filter((i) => !sameItem(i, id, kind)) })),

      updateQuantity: (id, kind, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => !sameItem(i, id, kind))
              : state.items.map((i) => (sameItem(i, id, kind) ? { ...i, quantity } : i)),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "florie-cart",
      version: 2, // v1 items were keyed by `productId` only (no combo support) — discard on upgrade
      migrate: (persisted, version) => (version < 2 ? { items: [] } : (persisted as CartState)),
    },
  ),
);

export function useCartCount(): number {
  return useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
}

export function useCartSubtotal(): number {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  );
}
