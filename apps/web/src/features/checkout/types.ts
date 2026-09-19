export type PaymentMethod = "COD" | "VNPAY" | "MOMO" | "ZALOPAY";

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
  paymentMethod?: PaymentMethod;
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
  // Present only when paymentMethod is an online gateway and it created
  // the redirect URL successfully — checkout-form.tsx sends the browser
  // there instead of straight to the confirmation page.
  paymentUrl?: string;
}
