export interface CustomerListItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  totalSpent: number;
  isVip: boolean;
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  ward: string | null;
  district: string | null;
  province: string | null;
  isDefault: boolean;
}

export interface CustomerNote {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
}

export interface CustomerOrderRow {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

export interface CustomerDetail extends CustomerListItem {
  addresses: CustomerAddress[];
  notes: CustomerNote[];
  orders: CustomerOrderRow[];
  _count: { orders: number };
}

export interface PaginatedCustomers {
  data: CustomerListItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
