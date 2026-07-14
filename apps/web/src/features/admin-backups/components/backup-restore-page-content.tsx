"use client";

import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { BackupRestorePanel } from "./backup-restore-panel";

export function BackupRestorePageContent() {
  const admin = useAdminAuthStore((state) => state.admin);

  if (admin?.role !== "ADMIN") {
    return (
      <p className="rounded-brand border-2 border-secondary bg-white p-5 text-sm text-foreground/60">
        Chỉ Quản trị viên (ADMIN) mới có quyền truy cập tính năng này.
      </p>
    );
  }

  return <BackupRestorePanel />;
}
