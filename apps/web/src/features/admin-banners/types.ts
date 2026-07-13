export type BannerPosition = "HOME" | "CATEGORY" | "PRODUCT" | "CHECKOUT";

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  position: BannerPosition;
  displayOrder: number;
  isActive: boolean;
}

export interface BannerFormInput {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position?: BannerPosition;
  displayOrder?: number;
  isActive?: boolean;
}

export interface PaginatedBanners {
  data: Banner[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
