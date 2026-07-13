export type OrderStatus = "NEW" | "CONFIRMED" | "ARRANGING" | "SHIPPING" | "COMPLETED" | "CANCELLED";

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED";
  paymentMethod: "COD" | "ONLINE";
  total: number;
  recipientName: string;
  recipientPhone: string;
  deliveryDate: string;
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
}

export interface QueryOrdersInput {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  deliveryDateFrom?: string;
  deliveryDateTo?: string;
  sortBy?: "createdAt" | "deliveryDate" | "total";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedOrders {
  data: OrderListItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
