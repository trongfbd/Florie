"use client";

import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { OrderDetailContent } from "./order-detail-content";
import { OrderDetailStaffView } from "./order-detail-staff-view";

// Chọn component theo role — STAFF vào 1 view riêng hoàn toàn tách bạch
// khỏi OrderDetailContent (không có tiền ở bất kỳ đâu), thay vì ẩn từng
// phần trong 1 component dùng chung.
export function OrderDetailPageContent({ orderId }: { orderId: string }) {
  const role = useAdminAuthStore((state) => state.admin?.role);

  if (role === "STAFF") {
    return <OrderDetailStaffView orderId={orderId} />;
  }

  return <OrderDetailContent orderId={orderId} />;
}
