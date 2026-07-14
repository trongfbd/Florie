export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  note: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface SupplierFormInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  note?: string;
  isActive?: boolean;
}

export interface PaginatedSuppliers {
  data: Supplier[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
