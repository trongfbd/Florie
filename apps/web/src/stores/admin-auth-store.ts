import { create } from "zustand";

// Hand-duplicated from Prisma's UserRole enum (no shared types package
// between apps/api and apps/web) — keep in sync manually when the enum
// changes. ADMIN unchanged/full access, OPERATIONS_ADMIN sees money but not
// cost price, STAFF sees neither.
export type AdminRole = "ADMIN" | "OPERATIONS_ADMIN" | "STAFF";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

interface AdminAuthState {
  accessToken: string | null;
  admin: AdminUser | null;
  hasHydrated: boolean;
  setSession: (accessToken: string, admin: AdminUser) => void;
  clearSession: () => void;
  setHydrated: () => void;
}

// Mirrors customer-auth-store.ts: access token kept in memory only, session
// restored via silent refresh against the httpOnly cookie on app load. Kept
// as a fully separate store/domain from the customer session on purpose.
export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  accessToken: null,
  admin: null,
  hasHydrated: false,
  setSession: (accessToken, admin) => set({ accessToken, admin }),
  clearSession: () => set({ accessToken: null, admin: null }),
  setHydrated: () => set({ hasHydrated: true }),
}));
