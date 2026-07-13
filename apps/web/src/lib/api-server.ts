import 'server-only';
import type {
  CategorySummary,
  PaginatedResult,
  ProductDetail,
  ProductListItem,
  StorefrontProductQuery,
} from '@/features/storefront/types';
import type { Review } from '@/features/reviews/types';

const API_BASE =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1${path}`, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error(`Storefront API ${path} failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export function getCategories(): Promise<CategorySummary[]> {
  return apiFetch<CategorySummary[]>('/storefront/categories');
}

export async function getCategoryBySlug(slug: string): Promise<CategorySummary | null> {
  try {
    return await apiFetch<CategorySummary>(`/storefront/categories/${slug}`);
  } catch {
    return null;
  }
}

export function getProducts(
  query: StorefrontProductQuery = {},
): Promise<PaginatedResult<ProductListItem>> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();

  return apiFetch<PaginatedResult<ProductListItem>>(`/storefront/products${qs ? `?${qs}` : ''}`);
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    return await apiFetch<ProductDetail>(`/storefront/products/${slug}`);
  } catch {
    return null;
  }
}

export function getRelatedProducts(slug: string): Promise<ProductListItem[]> {
  return apiFetch<ProductListItem[]>(`/storefront/products/${slug}/related`);
}

export async function getReviews(slug: string): Promise<Review[]> {
  try {
    return await apiFetch<Review[]>(`/storefront/products/${slug}/reviews`);
  } catch {
    return [];
  }
}
