"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatVnd } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/features/order-tracking/status-labels";
import { useChangeOrderStatus, useOrders } from "../hooks";
import { ALLOWED_TRANSITIONS } from "../lib/status-transitions";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONE } from "../lib/payment-status-labels";
import { ORDER_CHANNEL_LABELS } from "../lib/channel-labels";
import { parseSlotStartHour } from "../lib/delivery-slots";
import { OrderStatusBadge } from "./order-status-badge";
import type { OrderListItem, OrderStatus, QueryOrdersInput } from "../types";

const STATUS_OPTIONS: OrderStatus[] = [
  "NEW",
  "CONFIRMED",
  "ARRANGING",
  "READY",
  "SHIPPING",
  "COMPLETED",
  "DELIVERY_FAILED",
  "CANCELLED",
];

type Tab = "today" | "tomorrow" | "upcoming" | "overdue" | "unpaid" | "all";

const TABS: { key: Tab; label: string }[] = [
  { key: "today", label: "Hôm nay" },
  { key: "tomorrow", label: "Ngày mai" },
  { key: "upcoming", label: "Sắp tới" },
  { key: "overdue", label: "Quá hạn/Trễ" },
  { key: "unpaid", label: "Chưa thanh toán đủ" },
  { key: "all", label: "Tất cả" },
];

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function tabFilter(tab: Tab, dates: { today: string; tomorrow: string; dayAfter: string }): QueryOrdersInput {
  switch (tab) {
    case "today":
      return { deliveryDateFrom: dates.today, deliveryDateTo: dates.today };
    case "tomorrow":
      return { deliveryDateFrom: dates.tomorrow, deliveryDateTo: dates.tomorrow };
    case "upcoming":
      return { deliveryDateFrom: dates.dayAfter };
    case "overdue":
      return { overdue: true };
    case "unpaid":
      return { unpaidOnly: true };
    case "all":
      return {};
  }
}

type Urgency = "overdue" | "soon" | "done" | "normal";

function getRowUrgency(order: OrderListItem, now: Date, todayStr: string): Urgency {
  if (order.status === "COMPLETED" || order.status === "CANCELLED" || order.status === "DELIVERY_FAILED") {
    return "done";
  }
  const deliveryDateStr = toLocalDateString(new Date(order.deliveryDate));
  if (deliveryDateStr < todayStr) return "overdue";
  if (deliveryDateStr === todayStr) {
    const startHour = parseSlotStartHour(order.deliveryTime);
    if (startHour !== null) {
      const slotStart = new Date(now);
      slotStart.setHours(startHour, 0, 0, 0);
      const diffMs = slotStart.getTime() - now.getTime();
      if (diffMs < 0) return "overdue";
      if (diffMs <= 2 * 60 * 60 * 1000) return "soon";
    }
  }
  return "normal";
}

const URGENCY_ROW_CLASS: Record<Urgency, string> = {
  overdue: "bg-destructive/5",
  soon: "bg-accent/5",
  done: "opacity-60",
  normal: "",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function QuickStatusSelect({ order }: { order: OrderListItem }) {
  const changeStatus = useChangeOrderStatus(order.id);
  const nextOptions = ALLOWED_TRANSITIONS[order.status];

  if (nextOptions.length === 0) return <span className="text-xs text-foreground/40">—</span>;

  return (
    <select
      value=""
      disabled={changeStatus.isPending}
      onChange={(e) => {
        const value = e.target.value as OrderStatus;
        if (value) changeStatus.mutate({ toStatus: value });
      }}
      className="rounded-lg border-2 border-secondary bg-white px-2 py-1 text-xs outline-none focus:border-accent disabled:opacity-60"
    >
      <option value="">Đổi trạng thái...</option>
      {nextOptions.map((status) => (
        <option key={status} value={status}>
          {ORDER_STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}

export function OrdersTable() {
  const [tab, setTab] = useState<Tab>("today");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");

  const now = useMemo(() => new Date(), []);
  const dates = useMemo(() => {
    const today = new Date(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);
    return {
      today: toLocalDateString(today),
      tomorrow: toLocalDateString(tomorrow),
      dayAfter: toLocalDateString(dayAfter),
    };
  }, [now]);

  const activeFilter = tabFilter(tab, dates);
  const { data, isLoading } = useOrders({
    page,
    search: search || undefined,
    status: status || undefined,
    ...activeFilter,
  });

  // Thẻ thống kê luôn tính theo "Hôm nay", không phụ thuộc tab đang xem.
  const { data: todayData } = useOrders({ deliveryDateFrom: dates.today, deliveryDateTo: dates.today, limit: 100 });
  const todayStats = useMemo(() => {
    const orders = todayData?.data ?? [];
    const delivered = orders.filter((o) => o.status === "COMPLETED").length;
    const totalDue = orders.reduce((sum, o) => sum + (o.status === "COMPLETED" ? 0 : o.total - o.depositAmount), 0);
    return { count: orders.length, delivered, totalDue };
  }, [todayData]);

  // Số đếm cho từng tab (trừ "Tất cả" -- dùng meta.total của bảng chính khi đang xem tab đó).
  const { data: tomorrowCount } = useOrders({ ...tabFilter("tomorrow", dates), limit: 1 });
  const { data: upcomingCount } = useOrders({ ...tabFilter("upcoming", dates), limit: 1 });
  const { data: overdueCount } = useOrders({ ...tabFilter("overdue", dates), limit: 1 });
  const { data: unpaidCount } = useOrders({ ...tabFilter("unpaid", dates), limit: 1 });
  const tabCounts: Partial<Record<Tab, number>> = {
    today: todayStats.count,
    tomorrow: tomorrowCount?.meta.total,
    upcoming: upcomingCount?.meta.total,
    overdue: overdueCount?.meta.total,
    unpaid: unpaidCount?.meta.total,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-brand border-2 border-secondary bg-white p-3">
          <p className="text-xs text-foreground/50">Đơn giao hôm nay</p>
          <p className="font-display text-xl font-bold text-heading">{todayStats.count}</p>
        </div>
        <div className="rounded-brand border-2 border-secondary bg-white p-3">
          <p className="text-xs text-foreground/50">Đã giao / còn lại</p>
          <p className="font-display text-xl font-bold text-heading">
            {todayStats.delivered}/{todayStats.count}
          </p>
        </div>
        <div className="rounded-brand border-2 border-secondary bg-white p-3">
          <p className="text-xs text-foreground/50">Còn phải thu hôm nay</p>
          <p className="font-display text-xl font-bold text-accent">{formatVnd(todayStats.totalDue)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-accent text-white" : "bg-secondary text-heading/70 hover:bg-secondary/70"
            }`}
          >
            {t.label}
            {tabCounts[t.key] !== undefined && <span className="ml-1.5 opacity-80">({tabCounts[t.key]})</span>}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSearch(searchInput);
            }}
          >
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm theo mã đơn, tên, SĐT..."
              className="w-64 rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              Tìm
            </button>
          </form>

          <select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value as OrderStatus | "");
            }}
            className="rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {ORDER_STATUS_LABELS[option]}
              </option>
            ))}
          </select>
        </div>

        <Link
          href="/admin/don-hang/moi"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105"
        >
          + Tạo đơn hàng
        </Link>
      </div>

      <div className="overflow-x-auto rounded-brand border-2 border-secondary bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-secondary bg-secondary/30 text-left text-xs font-semibold uppercase text-foreground/60">
            <tr>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Người nhận</th>
              <th className="px-4 py-3">Ngày giao</th>
              <th className="px-4 py-3">Kênh</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thanh toán</th>
              <th className="px-4 py-3 text-right">Còn phải thu</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary">
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-foreground/50">
                  Đang tải...
                </td>
              </tr>
            )}
            {!isLoading && data?.data.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-foreground/50">
                  Không tìm thấy đơn hàng nào.
                </td>
              </tr>
            )}
            {data?.data.map((order) => {
              const urgency = getRowUrgency(order, now, dates.today);
              const amountDue = order.status === "COMPLETED" ? 0 : order.total - order.depositAmount;
              return (
                <tr key={order.id} className={`hover:bg-secondary/20 ${URGENCY_ROW_CLASS[urgency]}`}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/don-hang/${order.id}`} className="font-semibold text-accent hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-heading">{order.recipientName}</p>
                    <p className="text-xs text-foreground/50">{order.recipientPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {formatDate(order.deliveryDate)}
                    {order.deliveryTime && <span className="block text-xs text-foreground/50">{order.deliveryTime}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground/60">{ORDER_CHANNEL_LABELS[order.channel]}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PAYMENT_STATUS_TONE[order.paymentStatus]}`}
                    >
                      {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-heading">{formatVnd(amountDue)}</td>
                  <td className="px-4 py-3 text-right">
                    <QuickStatusSelect order={order} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-full border border-primary px-3 py-1.5 text-sm disabled:pointer-events-none disabled:text-foreground/30"
          >
            Trước
          </button>
          <span className="text-sm text-foreground/60">
            Trang {data.meta.page}/{data.meta.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-primary px-3 py-1.5 text-sm disabled:pointer-events-none disabled:text-foreground/30"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
