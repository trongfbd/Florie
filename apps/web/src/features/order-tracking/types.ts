export interface TrackedOrder {
  orderNumber: string;
  status: string;
  recipientName: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTime: string | null;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  statusHistory: { toStatus: string; note: string | null; changedAt: string }[];
}
