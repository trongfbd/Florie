export type ProductStatus = "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  color: string | null;
  status: ProductStatus;
  category: { id: string; name: string };
  images: { url: string }[];
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface ProductFormInput {
  name: string;
  slug?: string;
  description?: string;
  categoryId: string;
  basePrice: number;
  salePrice?: number;
  color?: string;
  status?: ProductStatus;
}

export interface PaginatedProducts {
  data: ProductListItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
