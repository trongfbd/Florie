import { UserRole } from '@prisma/client';

// latestCostPrice (giá vốn nguyên vật liệu, cập nhật mỗi lần nhập kho) chỉ
// ADMIN được thấy — OPERATIONS_ADMIN vào được trang Vật tư (quản lý tồn kho)
// nhưng không thấy giá vốn, cùng tinh thần ẩn giá gốc ở Sản phẩm/Đơn hàng.
export function redactMaterialForRole<T extends { latestCostPrice?: unknown }>(
  material: T,
  role: UserRole,
): T {
  if (role === UserRole.ADMIN) {
    return material;
  }
  const rest: Partial<T> = { ...material };
  delete rest.latestCostPrice;
  return rest as T;
}
