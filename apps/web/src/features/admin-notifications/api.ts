import { adminApiClient } from "@/lib/admin-api-client";
import type { PaginatedNotifications } from "./types";

export async function fetchNotifications(query: { page?: number; limit?: number }): Promise<PaginatedNotifications> {
  const { data } = await adminApiClient.get<PaginatedNotifications>("/api/v1/notifications", { params: query });
  return data;
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await adminApiClient.get<{ count: number }>("/api/v1/notifications/unread-count");
  return data.count;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await adminApiClient.patch(`/api/v1/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await adminApiClient.patch("/api/v1/notifications/read-all");
}
