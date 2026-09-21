export type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "ARRANGING"
  | "READY"
  | "SHIPPING"
  | "COMPLETED"
  | "DELIVERY_FAILED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "DEPOSITED" | "PAID" | "REFUNDED";
export type PaymentMethod = "COD" | "VNPAY" | "MOMO" | "ZALOPAY";
export type OrderChannel = "WEB" | "ZALO" | "FACEBOOK" | "TIKTOK" | "PHONE" | "WALK_IN" | "B2B";

export interface OrderImageRow {
  id: string;
  url: string;
  altText: string | null;
  kind: "REFERENCE";
  displayOrder: number;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  channel: OrderChannel;
  total: number;
  depositAmount: number;
  discountAmount: number;
  recipientName: string;
  recipientPhone: string;
  guestName: string | null;
  deliveryDate: string;
  deliveryTime: string | null;
  deliveryDistrict: string | null;
  customer: { id: string; name: string; phone: string | null } | null;
  createdAt: string;
}

export interface OrderItemRow {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderStatusHistoryRow {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note: string | null;
  changedAt: string;
  changedBy: { id: string; name: string } | null;
}

export interface OrderDetail extends OrderListItem {
  guestName: string | null;
  guestPhone: string | null;
  deliveryAddress: string;
  deliveryTime: string | null;
  cardMessage: string | null;
  note: string | null;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  voucher: { id: string; code: string } | null;
  createdBy: { id: string; name: string } | null;
  items: OrderItemRow[];
  statusHistory: OrderStatusHistoryRow[];
  images: OrderImageRow[];
}

export interface QueryOrdersInput {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  channel?: OrderChannel;
  overdue?: boolean;
  unpaidOnly?: boolean;
  customerId?: string;
  voucherId?: string;
  deliveryDateFrom?: string;
  deliveryDateTo?: string;
  sortBy?: "createdAt" | "deliveryDate" | "total";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedOrders {
  data: OrderListItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface UpdateOrderInput {
  recipientName?: string;
  recipientPhone?: string;
  deliveryAddress?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  cardMessage?: string;
  note?: string;
}

export interface UpdatePaymentInput {
  paymentStatus: PaymentStatus;
  depositAmount?: number;
}

export interface CreateOrderItemInput {
  productId?: string;
  comboId?: string;
  customName?: string;
  customPrice?: number;
  customCostPrice?: number;
  quantity: number;
}

export interface CreateOrderInput {
  customerId?: string;
  guestName?: string;
  guestPhone?: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryDistrict?: string;
  deliveryDate: string;
  deliveryTime?: string;
  cardMessage?: string;
  note?: string;
  paymentMethod?: PaymentMethod;
  shippingFee?: number;
  depositAmount?: number;
  voucherCode?: string;
  channel?: OrderChannel;
  items: CreateOrderItemInput[];
}
