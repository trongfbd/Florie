"use client";

import Link from "next/link";
import { useState } from "react";
import { formatVnd } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/features/order-tracking/status-labels";
import { useOrders } from "../hooks";
import { OrderStatusBadge } from "./order-status-badge";
import type { OrderStatus } from "../types";

const STATUS_OPTIONS: OrderStatus[] = ["NEW", "CONFIRMED", "ARRANGING", "SHIPPING", "COMPLETED", "CANCELLED"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function OrdersTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");

  const { data, isLoading } = useOrders({ page, search: search || undefined, status: status || undefined });

  return (
    <div className="space-y-4">
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

      <div className="overflow-x-auto rounded-brand border-2 border-secondary bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-secondary bg-secondary/30 text-left text-xs font-semibold uppercase text-foreground/60">
            <tr>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Người nhận</th>
              <th className="px-4 py-3">Ngày giao</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Tổng tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">
                  Đang tải...
                </td>
              </tr>
            )}
            {!isLoading && data?.data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">
                  Không tìm thấy đơn hàng nào.
                </td>
              </tr>
            )}
            {data?.data.map((order) => (
              <tr key={order.id} className="hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <Link href={`/admin/don-hang/${order.id}`} className="font-semibold text-accent hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-heading">{order.recipientName}</p>
                  <p className="text-xs text-foreground/50">{order.recipientPhone}</p>
                </td>
                <td className="px-4 py-3 text-foreground/70">{formatDate(order.deliveryDate)}</td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-right font-semibold text-heading">{formatVnd(order.total)}</td>
              </tr>
            ))}
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
