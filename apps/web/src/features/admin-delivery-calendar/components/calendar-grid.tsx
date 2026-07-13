"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useOrders } from "@/features/admin-orders/hooks";
import { OrderStatusBadge } from "@/features/admin-orders/components/order-status-badge";
import type { OrderListItem } from "@/features/admin-orders/types";
import { buildMonthGrid, dateKey, MONTH_LABEL, toIsoDate, WEEKDAY_LABELS } from "../utils";

export function CalendarGrid() {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const grid = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);
  const gridStart = grid[0];
  const gridEnd = grid[grid.length - 1];

  const { data, isLoading } = useOrders({
    deliveryDateFrom: toIsoDate(gridStart),
    deliveryDateTo: toIsoDate(gridEnd),
    sortBy: "deliveryDate",
    sortOrder: "asc",
    limit: 100,
  });

  const ordersByDay = useMemo(() => {
    const map = new Map<string, OrderListItem[]>();
    for (const order of data?.data ?? []) {
      const key = dateKey(new Date(order.deliveryDate));
      const existing = map.get(key) ?? [];
      existing.push(order);
      map.set(key, existing);
    }
    return map;
  }, [data]);

  const todayKey = dateKey(today);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-heading">{MONTH_LABEL(cursor.getFullYear(), cursor.getMonth())}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-secondary text-heading hover:bg-secondary"
            aria-label="Tháng trước"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="rounded-full border border-secondary px-3 py-1.5 text-sm font-semibold text-heading hover:bg-secondary"
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-secondary text-heading hover:bg-secondary"
            aria-label="Tháng sau"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-foreground/50">Đang tải...</p>}

      <div className="overflow-hidden rounded-brand border-2 border-secondary bg-white">
        <div className="grid grid-cols-7 border-b border-secondary bg-secondary/30 text-xs font-semibold uppercase text-foreground/60">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="px-2 py-2 text-center">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {grid.map((day) => {
            const key = dateKey(day);
            const isCurrentMonth = day.getMonth() === cursor.getMonth();
            const dayOrders = ordersByDay.get(key) ?? [];
            const isToday = key === todayKey;

            return (
              <div
                key={key}
                className={`min-h-28 border-b border-r border-secondary/70 p-1.5 last:border-r-0 ${
                  isCurrentMonth ? "bg-white" : "bg-secondary/10"
                }`}
              >
                <p
                  className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday
                      ? "bg-accent text-white"
                      : isCurrentMonth
                        ? "text-heading"
                        : "text-foreground/30"
                  }`}
                >
                  {day.getDate()}
                </p>
                <div className="space-y-1">
                  {dayOrders.slice(0, 3).map((order) => (
                    <Link
                      key={order.id}
                      href={`/admin/don-hang/${order.id}`}
                      className="block truncate rounded bg-secondary/50 px-1.5 py-0.5 text-[11px] font-medium text-heading hover:bg-secondary"
                      title={`${order.orderNumber} — ${order.recipientName}`}
                    >
                      {order.orderNumber}
                    </Link>
                  ))}
                  {dayOrders.length > 3 && (
                    <p className="px-1.5 text-[11px] font-medium text-accent">+{dayOrders.length - 3} khác</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {(data?.meta.total ?? 0) > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-xs text-foreground/60">
          <span>{data?.meta.total} đơn giao trong tháng</span>
          <OrderStatusLegend />
        </div>
      )}
    </div>
  );
}

function OrderStatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <OrderStatusBadge status="NEW" />
      <OrderStatusBadge status="CONFIRMED" />
      <OrderStatusBadge status="ARRANGING" />
      <OrderStatusBadge status="SHIPPING" />
      <OrderStatusBadge status="COMPLETED" />
      <OrderStatusBadge status="CANCELLED" />
    </div>
  );
}
