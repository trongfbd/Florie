"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCustomerAuthStore } from "@/stores/customer-auth-store";
import { useLogoutCustomer } from "@/features/customer-auth/hooks";
import { formatVnd } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { ORDER_STATUS_LABELS } from "@/features/order-tracking/status-labels";
import { MyVouchersSection } from "@/features/voucher-claims/components/my-vouchers-section";
import { fetchMyOrders } from "../api";

function OrderListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex items-center justify-between gap-2 rounded-brand border-2 border-secondary bg-white p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="ml-auto h-4 w-20" />
            <Skeleton className="ml-auto h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AccountPageContent() {
  const router = useRouter();
  const customer = useCustomerAuthStore((state) => state.customer);
  const hasHydrated = useCustomerAuthStore((state) => state.hasHydrated);
  const logoutMutation = useLogoutCustomer();

  useEffect(() => {
    if (hasHydrated && !customer) {
      router.replace("/dang-nhap?redirect=/tai-khoan");
    }
  }, [hasHydrated, customer, router]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: fetchMyOrders,
    enabled: !!customer,
  });

  if (!hasHydrated || !customer) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-brand border-2 border-secondary bg-white p-6">
        <div className="flex items-center gap-4">
          {customer.avatarUrl ? (
            <Image
              src={customer.avatarUrl}
              alt={customer.name}
              width={56}
              height={56}
              className="rounded-full border-2 border-secondary"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary font-display text-xl font-bold text-accent">
              {customer.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-display text-xl font-bold text-heading">{customer.name}</p>
            {customer.phone && <p className="text-sm text-foreground/60">{customer.phone}</p>}
            {customer.email && <p className="text-sm text-foreground/60">{customer.email}</p>}
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/wishlist"
            className="rounded-full border-2 border-secondary px-5 py-2 text-sm font-semibold text-heading transition-colors hover:border-accent hover:text-accent"
          >
            Sản phẩm yêu thích
          </Link>
          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            className="rounded-full border-2 border-secondary px-5 py-2 text-sm font-semibold text-heading transition-colors hover:border-destructive hover:text-destructive"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <MyVouchersSection />

      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-heading">Lịch sử đơn hàng</h2>

        {isLoading && <OrderListSkeleton />}

        {orders && orders.data.length === 0 && (
          <p className="text-foreground/60">Bạn chưa có đơn hàng nào.</p>
        )}

        {orders && orders.data.length > 0 && (
          <div className="space-y-3">
            {orders.data.map((order) => (
              <Link
                key={order.id}
                href={`/theo-doi-don-hang?orderNumber=${encodeURIComponent(order.orderNumber)}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-brand border-2 border-secondary bg-white p-4 transition-colors hover:border-accent"
              >
                <div>
                  <p className="font-semibold text-heading">{order.orderNumber}</p>
                  <p className="text-xs text-foreground/60">
                    Giao ngày {order.deliveryDate.slice(0, 10)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent">{formatVnd(order.total)}</p>
                  <p className="text-xs font-semibold text-foreground/70">
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
