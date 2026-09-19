"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { playNewOrderSound } from "./notification-sound";
import type { Notification } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const NOTIFICATIONS_QUERY_KEY = ["admin-notifications"];

// Free, self-hosted real-time push (socket.io, same server, no Firebase/
// Supabase) — replaces the 30s poll in hooks.ts with an instant refetch the
// moment the API creates a notification. The poll stays as a fallback for
// when the socket is disconnected (sleep/wake, network blip), so nothing
// breaks if this connection never comes up.
export function useNotificationsSocket() {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(`${API_BASE_URL}/notifications`, {
      auth: { token: accessToken },
      transports: ["websocket"],
      // Must match the server's path exactly (notifications.gateway.ts) —
      // under /api/ so nginx's existing location /api/ block covers this
      // in production too, instead of falling through to the web container.
      path: "/api/socket.io/",
    });

    socket.on("notification:new", (notification: Notification) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      if (notification.type === "NEW_ORDER") {
        playNewOrderSound();
      }
    });

    return () => {
      socket.close();
    };
  }, [accessToken, queryClient]);
}
