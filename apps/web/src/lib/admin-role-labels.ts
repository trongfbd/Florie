import type { AdminRole } from "@/stores/admin-auth-store";

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  ADMIN: "Quản trị viên",
  OPERATIONS_ADMIN: "Quản lý vận hành",
  STAFF: "Nhân viên",
};
