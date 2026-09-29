"use client";

import { RequireRole } from "@/components/admin/require-role";
import { BackupRestorePanel } from "./backup-restore-panel";

export function BackupRestorePageContent() {
  return (
    <RequireRole roles={["ADMIN"]}>
      <BackupRestorePanel />
    </RequireRole>
  );
}
