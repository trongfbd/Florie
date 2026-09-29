"use client";

import type { ReactNode } from "react";
import { useAdminAuthStore, type AdminRole } from "@/stores/admin-auth-store";

interface RequireRoleProps {
  roles: AdminRole[];
  children: ReactNode;
}

// Chặn ở tầng trang, không chỉ ẩn menu — STAFF gõ thẳng URL của 1 trang bị
// khoá cũng không vào được. Đặt trong layout.tsx của từng nhóm trang (hoặc
// trực tiếp trong page.tsx với trang không có route con) để phủ toàn bộ
// route con (list/moi/[id]) chỉ với 1 chỗ kiểm tra. Không cần xử lý
// hasHydrated — AdminAuthGuard ở (dashboard)/layout.tsx đã chặn render cho
// tới khi admin chắc chắn có giá trị.
export function RequireRole({ roles, children }: RequireRoleProps) {
  const role = useAdminAuthStore((state) => state.admin?.role);

  if (!role || !roles.includes(role)) {
    return (
      <p className="rounded-brand border-2 border-secondary bg-white p-5 text-sm text-foreground/60">
        Bạn không có quyền truy cập trang này.
      </p>
    );
  }

  return <>{children}</>;
}
