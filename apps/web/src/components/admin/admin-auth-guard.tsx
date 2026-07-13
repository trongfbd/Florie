"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { refreshAdminSession } from "@/lib/admin-api-client";
import { useAdminAuthStore } from "@/stores/admin-auth-store";

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const admin = useAdminAuthStore((state) => state.admin);
  const hasHydrated = useAdminAuthStore((state) => state.hasHydrated);
  const setHydrated = useAdminAuthStore((state) => state.setHydrated);

  useEffect(() => {
    refreshAdminSession().finally(() => setHydrated());
  }, [setHydrated]);

  useEffect(() => {
    if (hasHydrated && !admin) {
      router.replace("/admin/dang-nhap");
    }
  }, [hasHydrated, admin, router]);

  if (!hasHydrated || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-foreground/50">
        Đang tải...
      </div>
    );
  }

  return <>{children}</>;
}
