import type { AdminRole } from "@/stores/admin-auth-store";

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminUserInput {
  email: string;
  password: string;
  name: string;
  role: AdminRole;
}
