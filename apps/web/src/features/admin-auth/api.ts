import { adminApiClient } from "@/lib/admin-api-client";
import type { AdminAuthResponse, AdminLoginInput } from "./types";

export async function loginAdmin(input: AdminLoginInput): Promise<AdminAuthResponse> {
  const { data } = await adminApiClient.post<AdminAuthResponse>("/api/v1/auth/login", input);
  return data;
}

export async function logoutAdmin(): Promise<void> {
  await adminApiClient.post("/api/v1/auth/logout");
}
