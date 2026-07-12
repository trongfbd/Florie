export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  _count: { products: number; children: number };
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  displayOrder: number;
}

export interface ProductTag {
  tag: { id: string; name: string; slug: string; type: 'OCCASION' | 'GENERAL' };
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  salePrice: number | null;
  color: string | null;
  status: string;
  category: { id: string; name: string; slug: string };
  images: ProductImage[];
  tags: ProductTag[];
}

export interface ProductDetail extends ProductListItem {
  seoTitle: string | null;
  seoDescription: string | null;
  viewCount: number;
  materials: unknown[];
}

export interface StorefrontProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  color?: string;
  tagId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'priceAsc' | 'priceDesc' | 'name';
}
