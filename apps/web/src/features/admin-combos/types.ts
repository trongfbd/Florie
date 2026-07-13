export interface ComboItem {
  id: string;
  productId: string;
  quantity: number;
  product: { id: string; name: string };
}

export interface Combo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  isActive: boolean;
  items: ComboItem[];
}

export interface ComboItemInput {
  productId: string;
  quantity: number;
}

export interface ComboFormInput {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  price: number;
  isActive?: boolean;
  items: ComboItemInput[];
}

export interface PaginatedCombos {
  data: Combo[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
