export interface Popup {
  id: string;
  title: string;
  imageUrl: string | null;
  content: string | null;
  linkUrl: string | null;
  isActive: boolean;
  voucherId: string | null;
  voucher: { id: string; code: string } | null;
  showToNewCustomers: boolean;
  returningCustomerMinOrders: number | null;
}

export interface PopupFormInput {
  title: string;
  imageUrl?: string;
  content?: string;
  linkUrl?: string;
  isActive?: boolean;
  voucherId?: string;
  showToNewCustomers?: boolean;
  returningCustomerMinOrders?: number;
}

export interface PaginatedPopups {
  data: Popup[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
