import type { AdminUser } from "@/stores/admin-auth-store";

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  accessToken: string;
  user: AdminUser;
}
