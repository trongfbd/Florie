import { adminApiClient } from "@/lib/admin-api-client";
import type { PaginatedSuppliers, Supplier, SupplierFormInput } from "./types";

export async function fetchSuppliers(query: { page?: number; limit?: number; search?: string }) {
  const { data } = await adminApiClient.get<PaginatedSuppliers>("/api/v1/suppliers", { params: query });
  return data;
}

export async function fetchSupplier(id: string): Promise<Supplier> {
  const { data } = await adminApiClient.get<Supplier>(`/api/v1/suppliers/${id}`);
  return data;
}

export async function createSupplier(input: SupplierFormInput): Promise<Supplier> {
  const { data } = await adminApiClient.post<Supplier>("/api/v1/suppliers", input);
  return data;
}

export async function updateSupplier(id: string, input: SupplierFormInput): Promise<Supplier> {
  const { data } = await adminApiClient.patch<Supplier>(`/api/v1/suppliers/${id}`, input);
  return data;
}

export async function deleteSupplier(id: string): Promise<void> {
  await adminApiClient.delete(`/api/v1/suppliers/${id}`);
}
