export const ORDER_STATUS_LABELS: Record<string, string> = {
  NEW: "Đơn mới",
  CONFIRMED: "Đã xác nhận",
  ARRANGING: "Đang cắm hoa",
  READY: "Chờ giao",
  SHIPPING: "Đang giao",
  COMPLETED: "Đã giao",
  DELIVERY_FAILED: "Giao thất bại",
  CANCELLED: "Đã hủy",
};

export const ORDER_STATUS_STEPS = [
  "NEW",
  "CONFIRMED",
  "ARRANGING",
  "READY",
  "SHIPPING",
  "COMPLETED",
] as const;
