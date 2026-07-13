import { adminApiClient } from "@/lib/admin-api-client";
import type { Banner, BannerFormInput, PaginatedBanners } from "./types";

export async function fetchBanners(): Promise<PaginatedBanners> {
  const { data } = await adminApiClient.get<PaginatedBanners>("/api/v1/banners", { params: { limit: 100 } });
  return data;
}

export async function fetchBanner(id: string): Promise<Banner> {
  const { data } = await adminApiClient.get<Banner>(`/api/v1/banners/${id}`);
  return data;
}

export async function createBanner(input: BannerFormInput): Promise<Banner> {
  const { data } = await adminApiClient.post<Banner>("/api/v1/banners", input);
  return data;
}

export async function updateBanner(id: string, input: Partial<BannerFormInput>): Promise<Banner> {
  const { data } = await adminApiClient.patch<Banner>(`/api/v1/banners/${id}`, input);
  return data;
}

export async function deleteBanner(id: string): Promise<void> {
  await adminApiClient.delete(`/api/v1/banners/${id}`);
}
