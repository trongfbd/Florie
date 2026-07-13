import { adminApiClient } from "@/lib/admin-api-client";
import type { FlashSale, FlashSaleFormInput, PaginatedFlashSales } from "./types";

export async function fetchFlashSales(query: { page?: number }): Promise<PaginatedFlashSales> {
  const { data } = await adminApiClient.get<PaginatedFlashSales>("/api/v1/flash-sales", { params: query });
  return data;
}

export async function fetchFlashSale(id: string): Promise<FlashSale> {
  const { data } = await adminApiClient.get<FlashSale>(`/api/v1/flash-sales/${id}`);
  return data;
}

export async function createFlashSale(input: FlashSaleFormInput): Promise<FlashSale> {
  const { data } = await adminApiClient.post<FlashSale>("/api/v1/flash-sales", input);
  return data;
}

export async function updateFlashSale(id: string, input: Partial<FlashSaleFormInput>): Promise<FlashSale> {
  const { data } = await adminApiClient.patch<FlashSale>(`/api/v1/flash-sales/${id}`, input);
  return data;
}

export async function deleteFlashSale(id: string): Promise<void> {
  await adminApiClient.delete(`/api/v1/flash-sales/${id}`);
}
