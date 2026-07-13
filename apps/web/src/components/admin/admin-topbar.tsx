"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { useLogoutAdmin } from "@/features/admin-auth/hooks";
import { NotificationBell } from "@/features/admin-notifications/components/notification-bell";

export function AdminTopbar() {
  const router = useRouter();
  const admin = useAdminAuthStore((state) => state.admin);
  const logoutMutation = useLogoutAdmin();

  function handleLogout() {
    logoutMutation.mutate(undefined, { onSuccess: () => router.push("/admin/dang-nhap") });
  }

  return (
    <header className="flex items-center justify-between border-b border-secondary bg-white px-6 py-3.5">
      <div />
      <div className="flex items-center gap-4">
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
