import type { Metadata } from "next";
import { RequireRole } from "@/components/admin/require-role";
import { CreateOrderContent } from "@/features/admin-orders/components/create-order-content";

export const metadata: Metadata = { title: "Thêm đơn hàng", robots: { index: false } };

export default function NewOrderPage() {
  return (
    <RequireRole roles={["ADMIN", "OPERATIONS_ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="font-display text-3xl font-bold text-heading">Thêm đơn hàng thủ công</h1>
          <p className="text-sm text-foreground/60">
            (<span className="font-bold text-destructive">*</span> là mục bắt buộc nhập)
          </p>
        </div>
        <CreateOrderContent />
      </div>
    </RequireRole>
  );
}
