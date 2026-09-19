import { create } from "zustand";

interface AdminUiState {
  isMobileSidebarOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
}

// Sidebar + topbar are sibling components under the dashboard layout, so the
// mobile drawer's open/closed state lives here rather than as local state in
// either one.
export const useAdminUiStore = create<AdminUiState>((set) => ({
  isMobileSidebarOpen: false,
  openMobileSidebar: () => set({ isMobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
}));
