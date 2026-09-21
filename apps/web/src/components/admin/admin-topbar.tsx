"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { useAdminUiStore } from "@/stores/admin-ui-store";
import { useLogoutAdmin } from "@/features/admin-auth/hooks";
import { NotificationBell } from "@/features/admin-notifications/components/notification-bell";

export function AdminTopbar() {
  const router = useRouter();
  const admin = useAdminAuthStore((state) => state.admin);
  const logoutMutation = useLogoutAdmin();
  const openMobileSidebar = useAdminUiStore((state) => state.openMobileSidebar);

  function handleLogout() {
    logoutMutation.mutate(undefined, { onSuccess: () => router.push("/admin/dang-nhap") });
  }

  return (
    <header className="flex items-center border-b border-secondary bg-white px-4 py-3.5 sm:px-6">
      <button
        type="button"
        aria-label="Mở menu"
        onClick={openMobileSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/60 hover:bg-secondary sm:hidden"
      >
        <Menu size={20} />
      </button>
      {/* ml-auto, not justify-between on the header -- the hamburger above
          is display:none on desktop (sm:hidden), leaving this as the only
          flex child; justify-between with a single child sits it at
          flex-start, not flex-end, which is what pushed this to the left
          right after the sidebar instead of the far right. */}
      <div className="ml-auto flex items-center gap-4">
        <NotificationBell />
        <div className="text-right text-sm">
          <p className="font-semibold text-heading">{admin?.name}</p>
          <p className="text-xs text-foreground/50">{admin?.role === "ADMIN" ? "Quản trị viên" : "Nhân viên"}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Đăng xuất"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/50 transition-colors hover:bg-secondary hover:text-destructive"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
