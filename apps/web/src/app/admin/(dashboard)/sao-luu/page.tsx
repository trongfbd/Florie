"use client";

import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { BackupRestorePanel } from "@/features/admin-backups/components/backup-restore-panel";

export default function AdminBackupsPage() {
  const admin = useAdminAuthStore((state) => state.admin);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Sao lưu &amp; Khôi phục</h1>
      {admin?.role === "ADMIN" ? (
        <BackupRestorePanel />
      ) : (
        <p className="rounded-brand border-2 border-secondary bg-white p-5 text-sm text-foreground/60">
          Chỉ Quản trị viên (ADMIN) mới có quyền truy cập tính năng này.
        </p>
      )}
    </div>
  );
}
