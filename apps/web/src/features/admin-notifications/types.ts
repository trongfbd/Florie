export type NotificationType = "NEW_ORDER" | "LOW_STOCK" | "NEW_CUSTOMER";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityId: string | null;
  createdAt: string;
}

export interface PaginatedNotifications {
  data: Notification[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
