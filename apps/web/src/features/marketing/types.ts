import type { PaginatedResult } from '@/features/storefront/types';

export interface ComboItemProduct {
  id: string;
  name: string;
  slug: string;
  images: { url: string }[];
}

export interface ComboItem {
  id: string;
  productId: string;
  quantity: number;
  product: ComboItemProduct;
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

export interface FlashSaleItem {
  id: string;
  productId: string;
  salePrice: number;
  quantityLimit: number | null;
  soldQuantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    images: { url: string }[];
  };
}

export interface FlashSale {
  id: string;
  name: string;
  startAt: string;
  endAt: string;
  isActive: boolean;
  items: FlashSaleItem[];
}

export type BannerPosition = 'HOME' | 'CATEGORY' | 'PRODUCT' | 'CHECKOUT';

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  position: BannerPosition;
  displayOrder: number;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnailUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  author: { id: string; name: string };
}

export type BlogListResult = PaginatedResult<Blog>;

export interface Popup {
  id: string;
  title: string;
  imageUrl: string | null;
  content: string | null;
  linkUrl: string | null;
}

export interface SiteSettings {
  facebookPixelId: string | null;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
}
