"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, PackageSearch, ShoppingBag, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadCount,
} from "../hooks";
import { useNotificationsSocket } from "../use-notifications-socket";
import { formatRelativeTime } from "../utils";
import type { Notification, NotificationType } from "../types";

const TYPE_ICON: Record<NotificationType, typeof ShoppingBag> = {
  NEW_ORDER: ShoppingBag,
  NEW_CUSTOMER: UserPlus,
  LOW_STOCK: PackageSearch,
};

function notificationHref(notification: Notification): string | null {
  switch (notification.type) {
    case "NEW_ORDER":
      return notification.relatedEntityId ? `/admin/don-hang/${notification.relatedEntityId}` : null;
    case "NEW_CUSTOMER":
      return notification.relatedEntityId ? `/admin/khach-hang/${notification.relatedEntityId}` : null;
    case "LOW_STOCK":
      return "/admin/tro-ly-ban-hang";
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: page } = useNotifications({ page: 1, limit: 10 });
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  useNotificationsSocket();

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const notifications = page?.data ?? [];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Thông báo"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground/50 transition-colors hover:bg-secondary hover:text-heading"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-lg border border-secondary bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-secondary px-4 py-3">
            <p className="font-semibold text-heading">Thông báo</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead.mutate()}
                className="text-xs font-medium text-accent hover:underline"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-foreground/50">Không có thông báo nào</p>
            )}
            {notifications.map((notification) => {
              const Icon = TYPE_ICON[notification.type];
              const href = notificationHref(notification);
              const content = (
                <div
                  className={cn(
                    "flex gap-3 border-b border-secondary/60 px-4 py-3 transition-colors hover:bg-secondary/40",
                    !notification.isRead && "bg-accent/5",
                  )}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-heading">
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-heading">{notification.title}</p>
                    <p className="line-clamp-2 text-xs text-foreground/60">{notification.message}</p>
                    <p className="mt-1 text-[11px] text-foreground/40">{formatRelativeTime(notification.createdAt)}</p>
                  </div>
                  {!notification.isRead && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Chưa đọc" />
                  )}
                </div>
              );

              function handleClick() {
                if (!notification.isRead) markAsRead.mutate(notification.id);
                setOpen(false);
              }

              return href ? (
                <Link key={notification.id} href={href} onClick={handleClick}>
                  {content}
                </Link>
              ) : (
                <button key={notification.id} type="button" className="w-full text-left" onClick={handleClick}>
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
