import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./api";

const KEY = ["admin-notifications"];
// Real-time push (use-notifications-socket.ts) is now the primary update
// path — this poll is just a fallback for when the socket is disconnected.
const POLL_INTERVAL_MS = 60_000;

export function useNotifications(query: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...KEY, "list", query],
    queryFn: () => fetchNotifications(query),
    refetchInterval: POLL_INTERVAL_MS,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [...KEY, "unread-count"],
    queryFn: fetchUnreadCount,
    refetchInterval: POLL_INTERVAL_MS,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
