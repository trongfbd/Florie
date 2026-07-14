export type ProductStatus = "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  displayOrder: number;
}

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

export interface ProductDetail extends Omit<ProductListItem, "images"> {
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  costPrice: number | null;
  images: ProductImage[];
}

export interface ProductFormInput {
  name: string;
  slug?: string;
  description?: string;
  categoryId: string;
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  color?: string;
  status?: ProductStatus;
}

export interface PaginatedProducts {
  data: ProductListItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
