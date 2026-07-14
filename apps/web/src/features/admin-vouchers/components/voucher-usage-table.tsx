"use client";

import Link from "next/link";
import { formatVnd } from "@/lib/format";
import { useOrders } from "@/features/admin-orders/hooks";
import { OrderStatusBadge } from "@/features/admin-orders/components/order-status-badge";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function VoucherUsageTable({ voucherId }: { voucherId: string }) {
  const { data, isLoading } = useOrders({
    voucherId,
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  return (
    <section className="rounded-brand border-2 border-secondary bg-white p-5">
      <h2 className="font-display text-lg font-bold text-heading">Đơn hàng đã dùng mã này</h2>
      <p className="mt-1 text-sm text-foreground/60">
        Bao gồm cả khách vãng lai và khách gõ mã trực tiếp — không chỉ khách đã &quot;claim&quot; từ popup.
      </p>

      <div className="mt-4 overflow-x-auto rounded-brand border-2 border-secondary">
        <table className="w-full text-sm">
          <thead className="border-b border-secondary bg-secondary/30 text-left text-xs font-semibold uppercase text-foreground/60">
            <tr>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Ngày</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Giảm giá</th>
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
                  Chưa có đơn hàng nào dùng mã này.
                </td>
              </tr>
            )}
            {data?.data.map((order) => (
              <tr key={order.id} className="hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <p className="font-medium text-heading">
                    {order.customer?.name ?? order.guestName ?? "Khách vãng lai"}
                  </p>
                  {!order.customer && <p className="text-xs text-foreground/50">Khách vãng lai</p>}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/don-hang/${order.id}`} className="font-semibold text-accent hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground/70">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-right font-semibold text-heading">
                  -{formatVnd(order.discountAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.meta.total > data.data.length && (
        <p className="mt-2 text-xs text-foreground/50">
          Chỉ hiển thị 100 đơn gần nhất trong tổng số {data.meta.total} đơn.
        </p>
      )}
    </section>
  );
}
