import { create } from "zustand";

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

interface CustomerAuthState {
  accessToken: string | null;
  customer: CustomerProfile | null;
  hasHydrated: boolean;
  setSession: (accessToken: string, customer: CustomerProfile) => void;
  clearSession: () => void;
  setHydrated: () => void;
}

// Deliberately NOT persisted to localStorage — the access token is kept in
// memory only. Session survives a page reload via a silent refresh call
// (the httpOnly refresh cookie), not by storing the token client-side.
export const useCustomerAuthStore = create<CustomerAuthState>((set) => ({
  accessToken: null,
  customer: null,
  hasHydrated: false,
  setSession: (accessToken, customer) => set({ accessToken, customer }),
  clearSession: () => set({ accessToken: null, customer: null }),
  setHydrated: () => set({ hasHydrated: true }),
}));
