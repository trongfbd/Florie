import type { PaymentStatus } from "../types";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Chưa thanh toán",
  DEPOSITED: "Đã cọc",
  PAID: "Đã thanh toán đủ",
  REFUNDED: "Đã hoàn tiền",
};

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, string> = {
  UNPAID: "bg-destructive/10 text-destructive",
  DEPOSITED: "bg-accent/15 text-accent",
  PAID: "bg-success/15 text-success",
  REFUNDED: "bg-secondary text-foreground/60",
};
