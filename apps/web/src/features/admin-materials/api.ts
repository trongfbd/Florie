import { adminApiClient } from "@/lib/admin-api-client";
import type { ImportStockInput, Material, MaterialFormInput, PaginatedMaterials } from "./types";

export async function fetchMaterials(query: {
  page?: number;
  limit?: number;
  search?: string;
  lowStock?: boolean;
}) {
  const { data } = await adminApiClient.get<PaginatedMaterials>("/api/v1/materials", { params: query });
  return data;
}

export async function fetchMaterial(id: string): Promise<Material> {
  const { data } = await adminApiClient.get<Material>(`/api/v1/materials/${id}`);
  return data;
}

export async function createMaterial(input: MaterialFormInput): Promise<Material> {
  const { data } = await adminApiClient.post<Material>("/api/v1/materials", input);
  return data;
}

export async function updateMaterial(id: string, input: MaterialFormInput): Promise<Material> {
  const { data } = await adminApiClient.patch<Material>(`/api/v1/materials/${id}`, input);
  return data;
}

export async function deleteMaterial(id: string): Promise<void> {
  await adminApiClient.delete(`/api/v1/materials/${id}`);
}

export async function importMaterialStock(id: string, input: ImportStockInput): Promise<Material> {
  const { data } = await adminApiClient.post<Material>(`/api/v1/materials/${id}/imports`, input);
  return data;
}
