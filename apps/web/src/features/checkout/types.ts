export interface CheckoutOrderItem {
  productId?: string;
  comboId?: string;
  quantity: number;
}

export interface VoucherPreviewInput {
  code: string;
  subtotal: number;
}

export interface VoucherPreviewResult {
  discountAmount: number;
  total: number;
}

export interface CheckoutInput {
  guestName?: string;
  guestPhone?: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTime?: string;
  cardMessage?: string;
  note?: string;
  paymentMethod?: "COD" | "ONLINE";
  voucherCode?: string;
  items: CheckoutOrderItem[];
}

export interface CheckoutOrderResult {
  id: string;
  orderNumber: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  recipientName: string;
  recipientPhone: string;
  deliveryDate: string;
}
