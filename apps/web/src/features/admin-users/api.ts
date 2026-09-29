import { adminApiClient } from "@/lib/admin-api-client";
import type { AdminRole } from "@/stores/admin-auth-store";
import type { AdminUserRow, CreateAdminUserInput } from "./types";

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const { data } = await adminApiClient.get<AdminUserRow[]>("/api/v1/users");
  return data;
}

export async function createAdminUser(input: CreateAdminUserInput): Promise<AdminUserRow> {
  const { data } = await adminApiClient.post<AdminUserRow>("/api/v1/users", input);
  return data;
}

export async function updateAdminUserRole(id: string, role: AdminRole): Promise<AdminUserRow> {
  const { data } = await adminApiClient.patch<AdminUserRow>(`/api/v1/users/${id}/role`, { role });
  return data;
}

export async function setAdminUserActive(id: string, isActive: boolean): Promise<AdminUserRow> {
  const { data } = await adminApiClient.patch<AdminUserRow>(`/api/v1/users/${id}/active`, { isActive });
  return data;
}
