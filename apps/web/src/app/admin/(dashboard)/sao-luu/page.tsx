import type { Metadata } from "next";
import { BackupRestorePageContent } from "@/features/admin-backups/components/backup-restore-page-content";

export const metadata: Metadata = { title: "Sao lưu & Khôi phục", robots: { index: false } };

export default function AdminBackupsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-heading">Sao lưu &amp; Khôi phục</h1>
      <BackupRestorePageContent />
    </div>
  );
}
