import 'server-only';
import type {
  CategorySummary,
  PaginatedResult,
  ProductDetail,
  ProductListItem,
  StorefrontProductQuery,
  StorefrontStats,
} from '@/features/storefront/types';
import type { Review } from '@/features/reviews/types';
import type {
  Banner,
  BannerPosition,
  Blog,
  BlogListResult,
  Combo,
  FlashSale,
  SiteSettings,
} from '@/features/marketing/types';

const API_BASE =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1${path}`, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error(`Storefront API ${path} failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function getCategories(): Promise<CategorySummary[]> {
  try {
    return await apiFetch<CategorySummary[]>('/storefront/categories');
  } catch {
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<CategorySummary | null> {
  try {
    return await apiFetch<CategorySummary>(`/storefront/categories/${slug}`);
  } catch {
    return null;
  }
}

export async function getProducts(
  query: StorefrontProductQuery = {},
): Promise<PaginatedResult<ProductListItem>> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();

  try {
    return await apiFetch<PaginatedResult<ProductListItem>>(
      `/storefront/products${qs ? `?${qs}` : ''}`,
    );
  } catch {
    return { data: [], meta: { page: 1, limit: query.limit ?? 20, total: 0, totalPages: 0 } };
  }
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    return await apiFetch<ProductDetail>(`/storefront/products/${slug}`);
  } catch {
    return null;
  }
}

export async function getRelatedProducts(slug: string): Promise<ProductListItem[]> {
  try {
    return await apiFetch<ProductListItem[]>(`/storefront/products/${slug}/related`);
  } catch {
    return [];
  }
}

export async function getReviews(slug: string): Promise<Review[]> {
  try {
    return await apiFetch<Review[]>(`/storefront/products/${slug}/reviews`);
  } catch {
    return [];
  }
}

export async function getCombos(): Promise<Combo[]> {
  try {
    return await apiFetch<Combo[]>('/storefront/combos');
  } catch {
    return [];
  }
}

export async function getComboBySlug(slug: string): Promise<Combo | null> {
  try {
    return await apiFetch<Combo>(`/storefront/combos/${slug}`);
  } catch {
    return null;
  }
}

export async function getActiveFlashSale(): Promise<FlashSale | null> {
  try {
    return await apiFetch<FlashSale | null>('/storefront/flash-sale');
  } catch {
    return null;
  }
}

export async function getBanners(position: BannerPosition = 'HOME'): Promise<Banner[]> {
  try {
    return await apiFetch<Banner[]>(`/storefront/banners?position=${position}`);
  } catch {
    return [];
  }
}

export async function getBlogs(
  query: { page?: number; search?: string } = {},
): Promise<BlogListResult> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.search) params.set('search', query.search);
  const qs = params.toString();

  try {
    return await apiFetch<BlogListResult>(`/storefront/blogs${qs ? `?${qs}` : ''}`);
  } catch {
    return { data: [], meta: { page: query.page ?? 1, limit: 20, total: 0, totalPages: 0 } };
  }
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    return await apiFetch<Blog>(`/storefront/blogs/${slug}`);
  } catch {
    return null;
  }
}

export async function getStorefrontStats(): Promise<StorefrontStats | null> {
  try {
    return await apiFetch<StorefrontStats>('/storefront/stats');
  } catch {
    return null;
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await apiFetch<SiteSettings>('/site-settings/public');
  } catch {
    return null;
  }
}
