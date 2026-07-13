import { adminApiClient } from "@/lib/admin-api-client";
import type { PaginatedProducts, ProductDetail, ProductFormInput } from "./types";

export async function fetchProducts(
  query: { page?: number; search?: string; limit?: number },
): Promise<PaginatedProducts> {
  const { data } = await adminApiClient.get<PaginatedProducts>("/api/v1/products", { params: query });
  return data;
}

export async function fetchProduct(id: string): Promise<ProductDetail> {
  const { data } = await adminApiClient.get<ProductDetail>(`/api/v1/products/${id}`);
  return data;
}

export async function createProduct(input: ProductFormInput): Promise<ProductDetail> {
  const { data } = await adminApiClient.post<ProductDetail>("/api/v1/products", input);
  return data;
}

export async function updateProduct(id: string, input: Partial<ProductFormInput>): Promise<ProductDetail> {
  const { data } = await adminApiClient.patch<ProductDetail>(`/api/v1/products/${id}`, input);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await adminApiClient.delete(`/api/v1/products/${id}`);
}
