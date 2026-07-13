export const ORDER_STATUS_LABELS: Record<string, string> = {
  NEW: "Đơn mới",
  CONFIRMED: "Đã xác nhận",
  ARRANGING: "Đang cắm hoa",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export const ORDER_STATUS_STEPS = ["NEW", "CONFIRMED", "ARRANGING", "SHIPPING", "COMPLETED"] as const;
